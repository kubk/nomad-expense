import { and, eq, gte, lte } from "drizzle-orm";
import type { DB } from "../db";
import { transactionTable } from "../../db/schema";
import type { ParsedTransaction } from "../bank-parsers/parsed-transaction";
import { AccountFromFamily } from "../../db/account/get-account-by-family-id";
import { createMoneyFull } from "../money/money";
import { getRulesByAccountId } from "../../db/transaction-import-rule/get-rules-by-account-id";
import { applyImportRules } from "./import-rules";
import { TransactionFull } from "../../db/db-types";
import { getUserById } from "../../db/user/get-user-by-id";
import { notifyViaTelegram } from "../notifications/notify-via-telegram";
import { getUserDisplayName } from "../user-display";

export type ImportResult = {
  removed: TransactionFull[];
  added: TransactionFull[];
};

export async function importTransactions(
  db: DB,
  account: AccountFromFamily,
  transactions: ParsedTransaction[],
  authorUserId: string,
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

  const importRules = await getRulesByAccountId(db, account.id);

  const newTransactions = transactions.map((transaction) => {
    const money = createMoneyFull({
      amountCents: transaction.amountCents,
      currency: transaction.currency,
    });

    const baseTransaction = {
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

    return applyImportRules(baseTransaction, importRules);
  });

  // First, get all transactions that will be deleted
  const removedTransactions = await db
    .select()
    .from(transactionTable)
    .where(dateRangeFilter);

  let addedTransactions: TransactionFull[] = [];

  await db.transaction(async (tx) => {
    await tx.delete(transactionTable).where(dateRangeFilter);
    addedTransactions = await tx
      .insert(transactionTable)
      .values(newTransactions)
      .returning();
  });

  // Send notification to family members
  const author = await getUserById(authorUserId);
  if (author) {
    await notifyViaTelegram({
      type: "uploadedBankStatement",
      familyId: account.familyId,
      excludeUserId: authorUserId,
      transactionAuthor: getUserDisplayName(author),
      bankAccountName: account.name,
      newTransactions: addedTransactions.length,
      removedTransactions: removedTransactions.length,
    });
  }

  return {
    removed: removedTransactions,
    added: addedTransactions,
  };
}
