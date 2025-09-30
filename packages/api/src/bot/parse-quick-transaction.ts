import { currencySchema, type TransactionType } from "../db/enums";
import { AccountSelect } from "../db/db-types";

type ParseError = {
  error: "invalid_number" | "invalid_currency" | "invalid_input";
};

export type SuccessResult = {
  amountCents: number;
  account: AccountSelect;
  description?: string;
  transactionType?: TransactionType;
};

export type ParseQuickTransactionResult = SuccessResult | ParseError;

export const parseQuickTransaction = (
  text: string,
  accounts: AccountSelect[],
): ParseQuickTransactionResult => {
  // Check for + prefix to determine transaction type
  let transactionType: TransactionType | undefined;
  let processedText = text;

  if (text.startsWith("+")) {
    transactionType = "income";
    processedText = text.slice(1).trim();
  } else {
    // Default to expense if no prefix
    transactionType = "expense";
  }

  const matches = processedText.match(/^(\S+)\s+(\S+)\s*(.*)$/);

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
      amountCents,
      account: account,
      description: description.trim(),
      transactionType,
    };
  }

  return {
    amountCents,
    account,
    transactionType,
  };
};
