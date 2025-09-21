import { z } from "zod";
import { currencySchema } from "../../db/enums";
import {
  ParsedTransaction,
  parsedTransactionSchema,
} from "./parsed-transaction";
import Papa from "papaparse";
import { DateTime } from "luxon";

export async function parseCsvFromFile(
  file: File,
): Promise<Record<string, string>[]> {
  const content = await file.text();

  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim(),
  });

  if (result.errors.length > 0) {
    throw new Error(
      `CSV parsing errors: ${result.errors.map((e) => e.message).join(", ")}`,
    );
  }

  return result.data;
}

const rowSchema = z.object({
  Amount: z.string(),
  Currency: currencySchema,
  Merchant: z.string(),
  Description: z.string(),
  Date: z.string(),
  "Date Time": z.string().optional(),
});

export async function parseWiseStatement(
  file: File,
): Promise<ParsedTransaction[]> {
  const csvData = await parseCsvFromFile(file);

  const transactions: ParsedTransaction[] = [];

  for (const row of csvData) {
    const validatedRow = rowSchema.parse(row);

    const amount = parseAmount(validatedRow.Amount);
    const transaction = {
      amountCents: Math.abs(amount),
      currency: validatedRow.Currency,
      description: validatedRow.Merchant || validatedRow.Description,
      info: validatedRow.Description,
      type: amount < 0 ? "expense" : "income",
      createdAt: parseDate(validatedRow["Date Time"] || validatedRow.Date),
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
  // Try Date Time format first: "20-09-2025 20:57:59.282"
  if (date.includes(" ")) {
    // Remove milliseconds if present
    const dateWithoutMs = date.split(".")[0];
    const parsed = DateTime.fromFormat(dateWithoutMs, "dd-MM-yyyy HH:mm:ss");
    if (parsed.isValid) {
      return parsed.toJSDate();
    }
  }

  // Fallback to Date format: "20-03-2024"
  const parsed = DateTime.fromFormat(date, "dd-MM-yyyy");
  if (parsed.isValid) {
    return parsed.toJSDate();
  }

  throw new Error(`Unable to parse date: ${date}`);
}
