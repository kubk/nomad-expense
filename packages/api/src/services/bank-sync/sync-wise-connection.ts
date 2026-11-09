import { and, eq, inArray } from "drizzle-orm";
import type { DB } from "../db";
import { accountTable, transactionTable } from "../../db/schema";
import type { BankConnection } from "../../db/db-types";
import {
  isSplitFunded,
  parseWiseActivities,
  type WiseDebit,
} from "../bank-parsers/wise-activity-parser";
import { WiseApiClient } from "../wise/wise-api";
import { createMoney } from "../money/money";
import { getFamilyBaseCurrency } from "../../db/user/get-family-base-currency";
import { getRulesByAccountId } from "../../db/transaction-import-rule/get-rules-by-account-id";
import { applyImportRules } from "../transaction-import/import-rules";

const SYNC_LOOKBACK_DAYS = 3;

async function getLinkedAccounts(db: DB, connection: BankConnection) {
  const accounts = await db
    .select({
      id: accountTable.id,
      currency: accountTable.currency,
    })
    .from(accountTable)
    .where(
      and(
        eq(accountTable.bankConnectionId, connection.id),
        eq(accountTable.familyId, connection.familyId),
      ),
    );

  if (accounts.length === 0) {
    throw new Error("No accounts are linked to this connection");
  }

  const currencies = accounts.map((account) => account.currency);
  const duplicate = currencies.find(
    (currency, index) => currencies.indexOf(currency) !== index,
  );
  if (duplicate) {
    throw new Error(`Several linked accounts have currency ${duplicate}`);
  }

  return accounts;
}

export async function syncWiseConnection(
  db: DB,
  connection: BankConnection,
  apiToken: string,
  now: Date,
): Promise<void> {
  const api = new WiseApiClient(apiToken);
  const accounts = await getLinkedAccounts(db, connection);
  const accountIds = accounts.map((account) => account.id);

  const since = new Date(now.getTime() - SYNC_LOOKBACK_DAYS * 86_400_000);
  const profileId = await api.getPersonalProfileId();
  const activities = await api.listActivities(profileId, { since, until: now });
  const activityById = new Map(activities.map((a) => [a.id, a]));

  const syncedTransactions =
    activities.length === 0
      ? []
      : await db
          .select({
            id: transactionTable.id,
            accountId: transactionTable.accountId,
            externalId: transactionTable.externalId,
          })
          .from(transactionTable)
          .where(
            and(
              inArray(transactionTable.accountId, accountIds),
              inArray(transactionTable.externalId, [...activityById.keys()]),
            ),
          );
  const syncedActivityIds = new Set(
    syncedTransactions.map((transaction) => transaction.externalId),
  );

  // Synced transactions are never updated, so the user's edits survive
  const newActivities = activities.filter((a) => !syncedActivityIds.has(a.id));
  const debitsByActivityId = new Map<string, WiseDebit[]>();
  for (const activity of newActivities.filter(isSplitFunded)) {
    if (!activity.resource) continue;
    debitsByActivityId.set(
      activity.id,
      await api.getCardTransactionDebits(profileId, activity.resource.id),
    );
  }
  const entries = parseWiseActivities(newActivities, debitsByActivityId);

  const baseCurrency = await getFamilyBaseCurrency(connection.familyId);

  for (const account of accounts) {
    const accountEntries = entries.filter(
      (entry) => entry.balanceCurrency === account.currency,
    );

    const removed = syncedTransactions.filter(
      (transaction) =>
        transaction.accountId === account.id &&
        activityById.get(transaction.externalId ?? "")?.status !== "COMPLETED",
    );

    const rules = await getRulesByAccountId(db, account.id);
    const newTransactions = await Promise.all(
      accountEntries.map(async (entry) => {
        const money = await createMoney(
          { amountCents: entry.amountCents, currency: account.currency },
          baseCurrency,
          entry.createdAt,
        );
        return applyImportRules(
          {
            accountId: account.id,
            description: entry.description,
            amount: money.amountCents,
            currency: money.currency,
            info: entry.info,
            source: "imported" as const,
            isCountable: true,
            usdAmount: money.baseAmountCents,
            type: entry.type,
            createdAt: entry.createdAt,
            externalId: entry.externalId,
          },
          rules,
        );
      }),
    );

    await db.transaction(async (tx) => {
      if (removed.length > 0) {
        await tx.delete(transactionTable).where(
          inArray(
            transactionTable.id,
            removed.map((transaction) => transaction.id),
          ),
        );
      }
      if (newTransactions.length > 0) {
        await tx.insert(transactionTable).values(newTransactions);
      }
    });
  }
}
