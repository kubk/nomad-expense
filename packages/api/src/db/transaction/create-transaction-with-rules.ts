import { getDb } from "../../services/db";
import { transactionTable } from "../schema";
import { createMoneyFullWithLiveRate } from "../../services/money/money";
import { applyImportRules } from "../../services/transaction-import/import-rules";
import { getRulesByAccountId } from "../transaction-import-rule/get-rules-by-account-id";
import { getAccountByFamilyId } from "../account/get-account-by-family-id";
import { getUserById } from "../user/get-user-by-id";
import { notifyViaTelegram } from "../../services/notifications/notify-via-telegram";
import { getUserDisplayName } from "../../services/user-display";
import { getFamilyBaseCurrency } from "../user/get-family-base-currency";
import type { TransactionType } from "../enums";

export async function createTransactionWithRules(
  accountId: string,
  familyId: string,
  description: string,
  amountCents: number,
  transactionType: TransactionType,
  authorUserId: string,
  createdAt?: Date,
) {
  const db = getDb();

  const accountResult = await getAccountByFamilyId(db, accountId, familyId);
  if (accountResult.type === "notFound") {
    throw new Error("Account not found or unauthorized");
  }

  const account = accountResult.account;
  const baseCurrency = await getFamilyBaseCurrency(familyId);

  // Use the transaction date for exchange rate, or current date if not provided
  const transactionDate = createdAt ?? new Date();

  const money = await createMoneyFullWithLiveRate(
    {
      amountCents: amountCents,
      currency: account.currency,
    },
    baseCurrency,
    transactionDate,
  );

  const importRules = await getRulesByAccountId(db, accountId);

  const processedTransaction = applyImportRules(
    {
      description,
      isCountable: true,
    },
    importRules,
  );

  const result = await db
    .insert(transactionTable)
    .values({
      accountId,
      description: processedTransaction.description,
      amount: money.amountCents,
      currency: account.currency,
      usdAmount: money.baseAmountCents,
      type: transactionType,
      isCountable: processedTransaction.isCountable,
      createdAt,
    })
    .returning();

  const transaction = result[0];

  // Send notification to family members
  const author = await getUserById(authorUserId);
  if (author) {
    await notifyViaTelegram({
      type: "newTransaction",
      familyId,
      excludeUserId: authorUserId,
      transactionAuthor: getUserDisplayName(author),
      description,
      money,
    });
  }

  return transaction;
}
