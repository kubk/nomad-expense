import { z } from "zod";
import type { TransactionType } from "../../db/enums";

export const wiseActivitySchema = z.object({
  id: z.string(),
  type: z.string(),
  resource: z.object({ type: z.string(), id: z.string() }).nullish(),
  title: z.string(),
  description: z.string().nullish(),
  primaryAmount: z.string(),
  secondaryAmount: z.string().nullish(),
  status: z.string(),
  createdOn: z.string(),
});

export type WiseActivity = z.infer<typeof wiseActivitySchema>;

type WiseBalanceEntry = {
  externalId: string;
  balanceCurrency: string;
  amountCents: number;
  type: TransactionType;
  description: string;
  info: string;
  createdAt: Date;
};

export type WiseDebit = { value: number; currency: string };

type ActivityAmount = {
  isIncoming: boolean;
  cents: number;
  currency: string;
};

function stripWiseMarkup(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function parseWiseAmount(text: string): ActivityAmount {
  const [, sign, value, currency] =
    /^([+\-−])?\s*([\d,]*\.?\d+)\s+([A-Z]{3,5})$/.exec(stripWiseMarkup(text)) ??
    [];
  if (!value || !currency) {
    throw new Error(`Unable to parse Wise amount: "${text}"`);
  }

  return {
    isIncoming: sign === "+",
    cents: Math.round(Number(value.replace(/,/g, "")) * 100),
    currency,
  };
}

function getCurrencyDecimals(currency: string): number {
  try {
    return (
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).resolvedOptions().maximumFractionDigits ?? 2
    );
  } catch {
    return 2;
  }
}

function formatAmount(amount: ActivityAmount): string {
  const decimals = getCurrencyDecimals(amount.currency);
  const value = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount.cents / 100);
  return `${value} ${amount.currency}`;
}

// Paid from several balances: secondaryAmount is "USD, THB"
export function isSplitFunded(activity: WiseActivity): boolean {
  return (
    activity.status === "COMPLETED" &&
    /^[A-Z]{3,5}(, ?[A-Z]{3,5})+$/.test(
      stripWiseMarkup(activity.secondaryAmount ?? ""),
    )
  );
}

const ignoredActivityTypes = new Set(["CARD_CHECK"]);

function parseConversion(activity: WiseActivity): WiseBalanceEntry[] {
  // Primary is credited, secondary is debited
  const credited = parseWiseAmount(activity.primaryAmount);
  if (!activity.secondaryAmount) {
    throw new Error(`Wise conversion ${activity.id} has no source amount`);
  }
  const debited = parseWiseAmount(activity.secondaryAmount);
  const description = `Converted ${formatAmount(debited)} to ${formatAmount(credited)}`;
  const createdAt = new Date(activity.createdOn);

  return [
    {
      externalId: activity.id,
      balanceCurrency: debited.currency,
      amountCents: debited.cents,
      type: "expense",
      description,
      info: description,
      createdAt,
    },
    {
      externalId: activity.id,
      balanceCurrency: credited.currency,
      amountCents: credited.cents,
      type: "income",
      description,
      info: description,
      createdAt,
    },
  ];
}

function describeActivity(
  activity: WiseActivity,
  counterparty: string,
  primary: ActivityAmount,
): { description: string; info: string } {
  switch (activity.type) {
    case "CARD_PAYMENT":
    case "CASH_WITHDRAWAL": {
      const sign = primary.isIncoming ? "-" : "";
      return {
        description: counterparty,
        info: `Card transaction of ${sign}${formatAmount(primary)} issued by ${counterparty}`,
      };
    }
    case "TRANSFER": {
      const text = primary.isIncoming
        ? `Received money from ${counterparty}`
        : `Sent money to ${counterparty}`;
      return { description: text, info: text };
    }
    case "DIRECT_DEBIT_TRANSACTION":
      return { description: counterparty, info: `Paid to ${counterparty}` };
    default:
      return { description: counterparty, info: counterparty };
  }
}

function getBalanceAmounts(
  activity: WiseActivity,
  primary: ActivityAmount,
  debits: WiseDebit[] | undefined,
): ActivityAmount[] {
  // Incoming: primary is what landed on the balance
  if (primary.isIncoming) return [primary];

  if (isSplitFunded(activity)) {
    if (!debits?.length) {
      throw new Error(
        `Wise activity ${activity.id} was paid from several balances, but their debits are unknown`,
      );
    }
    return debits.map((debit) => ({
      isIncoming: false,
      cents: Math.round(debit.value * 100),
      currency: debit.currency,
    }));
  }

  // Outgoing: secondary, when present, is what left the balance incl. fees
  return activity.secondaryAmount
    ? [parseWiseAmount(activity.secondaryAmount)]
    : [primary];
}

function parseWiseActivity(
  activity: WiseActivity,
  debits?: WiseDebit[],
): WiseBalanceEntry[] {
  if (activity.status !== "COMPLETED") return [];
  if (ignoredActivityTypes.has(activity.type)) return [];

  if (activity.type === "INTERBALANCE") {
    return parseConversion(activity);
  }

  const primary = parseWiseAmount(activity.primaryAmount);
  const counterparty = stripWiseMarkup(activity.title);
  const text = describeActivity(activity, counterparty, primary);

  return getBalanceAmounts(activity, primary, debits)
    .filter((amount) => amount.cents !== 0)
    .map((amount) => ({
      externalId: activity.id,
      balanceCurrency: amount.currency,
      amountCents: amount.cents,
      type: primary.isIncoming ? "income" : "expense",
      ...text,
      createdAt: new Date(activity.createdOn),
    }));
}

export function parseWiseActivities(
  activities: WiseActivity[],
  debitsByActivityId: ReadonlyMap<string, WiseDebit[]> = new Map(),
): WiseBalanceEntry[] {
  return activities.flatMap((activity) =>
    parseWiseActivity(activity, debitsByActivityId.get(activity.id)),
  );
}
