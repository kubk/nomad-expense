import { currencySchema } from "../db/enums";
import { AccountSelect } from "../db/db-types";

type ParseError = {
  error: "invalid_number" | "invalid_currency" | "invalid_input";
};

export type SuccessResult = {
  amount: number;
  account: AccountSelect;
  description?: string;
};

export type ParseQuickTransactionResult = SuccessResult | ParseError;

export const parseQuickTransaction = (
  text: string,
  accounts: AccountSelect[],
): ParseQuickTransactionResult => {
  const matches = text.match(/^(\S+)\s+(\S+)\s*(.*)$/);

  if (!matches) {
    return { error: "invalid_input" };
  }

  const [, amountStr, currency, description] = matches;

  // Validate amount is a number
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { error: "invalid_number" };
  }

  if (!currency) {
    return { error: "invalid_currency" };
  }

  // Validate currency and find matching account
  const currencyValidation = currencySchema.safeParse(currency.toUpperCase());
  if (!currencyValidation.success) {
    return { error: "invalid_currency" };
  }

  const validCurrency = currencyValidation.data;

  const account = accounts.find(
    (acc) => acc.currency.toLowerCase() === validCurrency.toLowerCase(),
  );

  if (!account) {
    return { error: "invalid_currency" };
  }

  // Convert amount to cents (multiply by 100 and round to avoid floating point issues)
  const amountCents = Math.round(amount * 100);

  if (description && description.trim()) {
    return {
      amount: amountCents,
      account: account,
      description: description.trim(),
    };
  }

  return {
    amount: amountCents,
    account: account,
  };
};
