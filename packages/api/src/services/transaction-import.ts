import { and, eq, gte, lte } from "drizzle-orm";
import type { DB } from "./db";
import { accountTable, transactionTable } from "../db/schema";
import type { WiseTransaction } from "./bank-parsers/wise-parser";

export type ImportResult = {
  removed: number;
  added: number;
};

export async function importTransactions(
  db: DB,
  accountId: string,
  familyId: string,
  transactions: WiseTransaction[],
): Promise<ImportResult> {
  if (transactions.length < 2) {
    throw new Error("Minimum transaction amount is 2");
  }

  // Verify account exists and belongs to the family
  const account = await db
    .select()
    .from(accountTable)
    .where(
      and(eq(accountTable.id, accountId), eq(accountTable.familyId, familyId)),
    )
    .limit(1);

  if (account.length === 0) {
    throw new Error("Account not found or access denied");
  }

  if (account[0].bankType !== "Wise") {
    throw new Error("This account is not configured for Wise bank statements");
  }

  // Find min and max dates from the imported transactions
  const dates = transactions.map((t) => t.createdAt);
  const minTransactionDate = new Date(
    Math.min(...dates.map((d) => d.getTime())),
  );
  const maxTransactionDate = new Date(
    Math.max(...dates.map((d) => d.getTime())),
  );

  // Prepare new transactions for insertion
  const newTransactions = transactions.map((transaction) => ({
    accountId,
    description: transaction.title,
    amount: transaction.amount,
    currency: transaction.currency,
    info: transaction.info,
    source: "imported" as const,
    isCountable: true,
    usdAmount: transaction.amount, // For now, use same amount - will be converted later
    type: "expense" as const, // Default to expense
    createdAt: transaction.createdAt,
  }));

  // First, count how many transactions will be deleted
  const existingTransactions = await db
    .select({ id: transactionTable.id })
    .from(transactionTable)
    .where(
      and(
        eq(transactionTable.accountId, accountId),
        eq(transactionTable.source, "imported"),
        gte(transactionTable.createdAt, minTransactionDate),
        lte(transactionTable.createdAt, maxTransactionDate),
      ),
    );

  const removedCount = existingTransactions.length;

  // Execute both operations
  await db
    .delete(transactionTable)
    .where(
      and(
        eq(transactionTable.accountId, accountId),
        eq(transactionTable.source, "imported"),
        gte(transactionTable.createdAt, minTransactionDate),
        lte(transactionTable.createdAt, maxTransactionDate),
      ),
    );

  await db.insert(transactionTable).values(newTransactions);

  // Return the count of deleted and inserted transactions
  return {
    removed: removedCount,
    added: newTransactions.length,
  };
}
