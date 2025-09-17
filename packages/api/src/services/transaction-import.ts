import { and, eq, gte, lte } from "drizzle-orm";
import type { DB } from "./db";
import { transactionTable } from "../db/schema";
import type { ParsedTransaction } from "./bank-parsers/parsed-transaction";
import { AccountFromFamily } from "../db/account/can-acess-account";
import { createMoneyFull } from "./money/money";

export type ImportResult = {
  removed: number;
  added: number;
};

export async function importTransactions(
  db: DB,
  account: AccountFromFamily,
  transactions: ParsedTransaction[],
): Promise<ImportResult> {
  if (transactions.length < 2) {
    throw new Error("Minimum transaction amount is 2");
  }

  // Find min and max dates from the imported transactions
  const dates = transactions.map((t) => t.createdAt);
  const minTransactionDate = new Date(
    Math.min(...dates.map((d) => d.getTime())),
  );
  const maxTransactionDate = new Date(
    Math.max(...dates.map((d) => d.getTime())),
  );

  const dateRangeFilter = and(
    eq(transactionTable.accountId, account.id),
    eq(transactionTable.source, "imported"),
    gte(transactionTable.createdAt, minTransactionDate),
    lte(transactionTable.createdAt, maxTransactionDate),
  );

  const newTransactions = transactions.map((transaction) => {
    const money = createMoneyFull({
      amount: { amountHuman: transaction.amount },
      currency: transaction.currency,
    });

    return {
      accountId: account.id,
      description: transaction.description,
      amount: money.amountCents,
      currency: money.currency,
      info: transaction.info,
      source: "imported" as const,
      isCountable: true,
      usdAmount: money.baseAmountCents,
      type: transaction.type,
      createdAt: transaction.createdAt,
    };
  });

  // First, count how many transactions will be deleted
  const existingTransactions = await db
    .select({ id: transactionTable.id })
    .from(transactionTable)
    .where(dateRangeFilter);

  const removedCount = existingTransactions.length;

  await db.transaction(async (tx) => {
    await tx.delete(transactionTable).where(dateRangeFilter);
    await tx.insert(transactionTable).values(newTransactions);
  });

  return {
    removed: removedCount,
    added: newTransactions.length,
  };
}
