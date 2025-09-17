import { convert, SupportedCurrency } from "./currency-converter";

export type MoneyFull = {
  type: "full";
  amountCents: number;
  currency: SupportedCurrency;
  baseAmountCents: number;
  baseCurrency: SupportedCurrency;
};

export function createMoneyFull({
  amount,
  currency,
}: {
  // Human amount - amount in user's currency, e.g. 20
  // Cents amount - amount in currency's smallest unit, e.g. 2000
  amount: { amountHuman: number } | { amountCents: number };
  currency: SupportedCurrency;
}): MoneyFull {
  // For now we keep USD hardcoded until we implement proper currency conversion
  const baseCurrency = "USD";

  const amountCents =
    "amountHuman" in amount
      ? Math.round(amount.amountHuman * 100)
      : amount.amountCents;

  return {
    type: "full" as const,
    amountCents,
    currency,
    baseCurrency,
    baseAmountCents: convert(amountCents, currency, baseCurrency),
  };
}
