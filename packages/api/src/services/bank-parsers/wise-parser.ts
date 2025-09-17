import { z } from "zod";
import { parseCSVFromFile } from "./csv-parser";
import { currencySchema } from "../../db/enums";
import {
  ParsedTransaction,
  parsedTransactionSchema,
} from "./parsed-transaction";

const wiseCSVRowSchema = z.object({
  Amount: z.string(),
  Currency: currencySchema,
  Merchant: z.string(),
  Description: z.string(),
  Date: z.string(),
});

export async function parseWiseStatement(
  file: File,
): Promise<ParsedTransaction[]> {
  const csvData = await parseCSVFromFile(file);

  const transactions: ParsedTransaction[] = [];

  for (const row of csvData) {
    // Fail fast - don't catch validation errors
    const validatedRow = wiseCSVRowSchema.parse(row);

    const amount = parseAmount(validatedRow.Amount);
    const transaction = {
      amount: Math.abs(amount),
      currency: validatedRow.Currency,
      description: validatedRow.Merchant || validatedRow.Description,
      info: validatedRow.Description,
      type: amount < 0 ? "expense" : "income",
      createdAt: parseDate(validatedRow.Date),
    };

    const validatedTransaction = parsedTransactionSchema.parse(transaction);
    transactions.push(validatedTransaction);
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
