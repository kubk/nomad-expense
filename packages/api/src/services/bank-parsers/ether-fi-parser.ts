import { DateTime } from "luxon";
import { readSheet, type CellValue, type Row } from "read-excel-file/universal";
import { z } from "zod";
import {
  type ParsedTransaction,
  type ParseTransactionFn,
  parsedTransactionSchema,
} from "./parsed-transaction";

const requiredHeaders = [
  "timestamp",
  "type",
  "description",
  "status",
  "amount",
  "currency",
] as const;

const ignoredStatuses = new Set(["DECLINED", "FAILED", "CANCELLED"]);
const etherFiStatusSchema = z.string().trim();

const etherFiRowSchema = z.object({
  timestamp: z.string().trim(),
  type: z.enum(["card_spend", "card_refund", "affiliate_reward"]),
  description: z.string().trim().min(1),
  status: etherFiStatusSchema,
  amount: z.number().finite(),
  currency: z.literal("USD"),
  category: z.string().trim().nullable().optional(),
});

type EtherFiRow = z.infer<typeof etherFiRowSchema>;

const transactionTypeByEtherFiType = {
  card_spend: "expense",
  card_refund: "income",
  affiliate_reward: "income",
} satisfies Record<EtherFiRow["type"], ParsedTransaction["type"]>;

export const parseEtherFiStatement: ParseTransactionFn = async (file) => {
  const sheet = await readSheet(file, "All Transactions", { trim: true });
  const headerRowIndex = sheet.findIndex((row) =>
    requiredHeaders.every((header) => row.includes(header)),
  );

  if (headerRowIndex === -1) {
    throw new Error("Unable to find Ether.fi transaction headers");
  }

  const headers = sheet[headerRowIndex];
  const transactions: ParsedTransaction[] = [];

  for (const row of sheet.slice(headerRowIndex + 1)) {
    if (row.every((cell) => cell === null)) {
      continue;
    }

    const rowRecord = rowToRecord(headers, row);
    const status = etherFiStatusSchema.parse(rowRecord.status);

    if (ignoredStatuses.has(status.toUpperCase())) {
      continue;
    }

    const parsedRow = etherFiRowSchema.parse(rowRecord);

    const transaction = parsedTransactionSchema.parse({
      amountCents: Math.round(Math.abs(parsedRow.amount) * 100),
      currency: parsedRow.currency,
      description: getDescription(parsedRow),
      info: parsedRow.category || undefined,
      type: transactionTypeByEtherFiType[parsedRow.type],
      createdAt: parseTimestamp(parsedRow.timestamp),
    });

    transactions.push(transaction);
  }

  return transactions;
};

function rowToRecord(
  headers: Row,
  row: Row,
): Record<string, CellValue | null> {
  const record: Record<string, CellValue | null> = {};

  for (const [index, header] of headers.entries()) {
    if (typeof header === "string") {
      record[header] = row[index] ?? null;
    }
  }

  return record;
}

function getDescription(row: EtherFiRow): string {
  if (row.type === "affiliate_reward" && row.description === row.type) {
    return "Affiliate Reward";
  }

  return row.description;
}

function parseTimestamp(timestamp: string): Date {
  const parsedTimestamp = DateTime.fromFormat(
    timestamp,
    "yyyy-MM-dd HH:mm:ss 'UTC'",
    { zone: "UTC" },
  );

  if (!parsedTimestamp.isValid) {
    throw new Error(`Unable to parse Ether.fi timestamp: ${timestamp}`);
  }

  return parsedTimestamp.toJSDate();
}
