import { z } from "zod";
import { parseCSVFromFile } from "../csv-parser";
import { currencySchema } from "../../db/enums";
import { SupportedCurrency } from "../currency-converter";

const wiseCSVRowSchema = z.object({
  Amount: z.string(),
  Currency: currencySchema,
  Merchant: z.string(),
  Description: z.string(),
  Date: z.string(),
});

export type WiseTransaction = {
  amount: number;
  currency: SupportedCurrency;
  title: string;
  info: string;
  createdAt: Date;
};

export async function parseWiseStatement(
  file: File,
): Promise<WiseTransaction[]> {
  const csvData = await parseCSVFromFile(file);

  const transactions: WiseTransaction[] = [];

  for (const row of csvData) {
    // Fail fast - don't catch validation errors
    const validatedRow = wiseCSVRowSchema.parse(row);

    const transaction: WiseTransaction = {
      amount: parseAmount(validatedRow.Amount),
      currency: validatedRow.Currency,
      title: validatedRow.Merchant || validatedRow.Description,
      info: validatedRow.Description,
      createdAt: parseDate(validatedRow.Date),
    };

    transactions.push(transaction);
  }

  return transactions;
}

function parseAmount(amountStr: string): number {
  // Convert string amount to cents (integer)
  const amount = parseFloat(amountStr);
  if (isNaN(amount)) {
    throw new Error(`Invalid amount: ${amountStr}`);
  }
  return Math.round(amount * 100);
}

function parseDate(date: string): Date {
  const [day, monthNumber, year] = date.split("-");
  return new Date(parseInt(year), parseInt(monthNumber) - 1, parseInt(day));
}
