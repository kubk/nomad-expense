import { DateTime } from "luxon";
import Papa from "papaparse";
import { readSheet, type CellValue, type Row } from "read-excel-file/universal";
import { z } from "zod";
import {
  type ParsedTransaction,
  type ParseTransactionFn,
  parsedTransactionSchema,
} from "./parsed-transaction";
import { StatementFormatError } from "./statement-import-error";

const requiredHeaders = [
  "timestamp",
  "type",
  "description",
  "status",
  "amount",
  "currency",
] as const;

const ignoredStatuses = new Set(["DECLINED", "FAILED", "CANCELLED"]);
const etherFiStatusSchema = z.string().trim().nullable();

const etherFiRowSchema = z.object({
  timestamp: z.string().trim(),
  type: z.enum([
    "card_spend",
    "card_refund",
    "affiliate_reward",
    "affiliate_payout",
  ]),
  description: z.string().trim().min(1),
  status: etherFiStatusSchema,
  amount: z.coerce.number().finite(),
  currency: z.literal("USD"),
  category: z.string().trim().nullable().optional(),
});

type EtherFiRow = z.infer<typeof etherFiRowSchema>;

const transactionTypeByEtherFiType = {
  card_spend: "expense",
  card_refund: "income",
  affiliate_reward: "income",
  affiliate_payout: "income",
} satisfies Record<EtherFiRow["type"], ParsedTransaction["type"]>;

export const parseEtherFiStatement: ParseTransactionFn = async (file) => {
  const sheet = (await isXlsxFile(file))
    ? await readXlsxRows(file)
    : await readCsvRows(file);

  const headerRowIndex = sheet.findIndex((row) =>
    requiredHeaders.every((header) => row.includes(header)),
  );

  if (headerRowIndex === -1) {
    throw new StatementFormatError(
      "Unable to find Ether.fi transaction headers",
    );
  }

  const headers = sheet[headerRowIndex];
  const transactions: ParsedTransaction[] = [];

  for (const row of sheet.slice(headerRowIndex + 1)) {
    if (row.every((cell) => cell === null)) {
      continue;
    }

    const rowRecord = rowToRecord(headers, row);
    const status = etherFiStatusSchema.parse(rowRecord.status);

    if (status && ignoredStatuses.has(status.toUpperCase())) {
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

async function isXlsxFile(file: File): Promise<boolean> {
  // XLSX is a ZIP archive, which always starts with "PK"
  const signature = new Uint8Array(await file.slice(0, 2).arrayBuffer());
  return signature[0] === 0x50 && signature[1] === 0x4b;
}

async function readXlsxRows(file: File): Promise<Row[]> {
  try {
    return await readSheet(file, "All Transactions", { trim: true });
  } catch (error) {
    throw new StatementFormatError(
      "Unable to read the Ether.fi transaction sheet",
      error,
    );
  }
}

async function readCsvRows(file: File): Promise<Row[]> {
  const result = Papa.parse<string[]>(await file.text(), {
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    throw new StatementFormatError(
      `Unable to read the Ether.fi CSV: ${result.errors.map((e) => e.message).join(", ")}`,
    );
  }

  return result.data.map((row) =>
    row.map((cell) => {
      const value = cell.trim();
      return value === "" ? null : value;
    }),
  );
}

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
