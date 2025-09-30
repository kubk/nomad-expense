import { getDb } from "../../services/db";
import { transactionTable } from "../schema";
import { createMoneyFull } from "../../services/money/money";
import { applyImportRules } from "../../services/transaction-import/import-rules";
import { getRulesByAccountId } from "../transaction-import-rule/get-rules-by-account-id";
import { getAccountByFamilyId } from "../account/get-account-by-family-id";
import type { TransactionType } from "../enums";

export async function createTransactionWithRules(
  accountId: string,
  familyId: string,
  description: string,
  amountCents: number,
  transactionType: TransactionType,
) {
  const db = getDb();

  const accountResult = await getAccountByFamilyId(db, accountId, familyId);
  if (accountResult.type === "notFound") {
    throw new Error("Account not found or unauthorized");
  }

  const account = accountResult.account;

  const money = createMoneyFull({
    amountCents: amountCents,
    currency: account.currency,
  });

  const importRules = await getRulesByAccountId(db, accountId);

  const processedTransaction = applyImportRules(
    {
      description,
      isCountable: true,
    },
    importRules,
  );

  await db.insert(transactionTable).values({
    accountId,
    description: processedTransaction.description,
    amount: money.amountCents,
    currency: account.currency,
    usdAmount: money.baseAmountCents,
    type: transactionType,
    isCountable: processedTransaction.isCountable,
  });
}
