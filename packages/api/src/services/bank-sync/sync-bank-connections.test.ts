import { beforeEach, describe, expect, it, vi } from "vitest";
import { and, eq, gte } from "drizzle-orm";
import { fixtures, setUpDbTest } from "../../lib/testing/set-up-db-test";
import { getDb } from "../db";
import {
  accountTable,
  bankConnectionTable,
  transactionTable,
} from "../../db/schema";
import { syncBankConnections } from "./sync-bank-connections";
import type { WiseApiClient } from "../wise/wise-api";
import type { WiseActivity } from "../bank-parsers/wise-activity-parser";
import { reportError } from "../../lib/report-error";
import { assert } from "../../lib/typescript/assert";

vi.mock("../../lib/report-error", () => ({
  reportError: vi.fn(),
}));

vi.mock("../money/exchange-rate-api", () => ({
  convertWithLiveRate: vi.fn(
    async (amountInCents: number, fromCurrency: string, toCurrency: string) =>
      fromCurrency === toCurrency
        ? amountInCents
        : Math.round(amountInCents / 33),
  ),
}));

const now = new Date("2026-11-09T12:00:00Z");
const connectionId = "0b1f8f3c-7a43-4d3e-9a49-5b7c3c1d2e01";
const thbAccountId = "8a0d3c52-56a4-4f43-b8a3-1b7f5d0c9e02";

const activities = {
  thbCardPayment: {
    id: "card-thb",
    type: "CARD_PAYMENT",
    resource: { type: "CARD_TRANSACTION", id: "101" },
    title: "<strong>Corner Shop</strong>",
    description: "",
    primaryAmount: "1,477.75 THB",
    secondaryAmount: "",
    status: "COMPLETED",
    createdOn: "2026-11-01T04:18:13.000Z",
  },
  usdTransfer: {
    id: "transfer-usd",
    type: "TRANSFER",
    resource: { type: "TRANSFER", id: "102" },
    title: "<strong>Digital Ocean</strong>",
    description: "Sent",
    primaryAmount: "57.50 CNY",
    secondaryAmount: "8.78 USD",
    status: "COMPLETED",
    createdOn: "2026-10-14T06:39:35.000Z",
  },
  usdIncome: {
    id: "income-usd",
    type: "TRANSFER",
    resource: { type: "TRANSFER", id: "103" },
    title: "<strong>ACME LLC</strong>",
    description: "",
    primaryAmount: "<positive>+ 500 USD</positive>",
    secondaryAmount: "",
    status: "COMPLETED",
    createdOn: "2026-10-28T19:56:51.000Z",
  },
  eurToUsd: {
    id: "conversion",
    type: "INTERBALANCE",
    resource: { type: "BALANCE_TRANSACTION", id: "104" },
    title: "To <strong>USD</strong>",
    description: "Moved",
    primaryAmount: "10 USD",
    secondaryAmount: "8.50 EUR",
    status: "COMPLETED",
    createdOn: "2026-10-20T10:00:00.000Z",
  },
} satisfies Record<string, WiseActivity>;

function createFakeApi(items: WiseActivity[]) {
  return {
    getPersonalProfileId: vi.fn(async () => 1),
    listActivities: vi.fn(async () => items),
    getCardTransactionDebits: vi.fn(async () => [
      { value: 5.38, currency: "USD" },
      { value: 73.87, currency: "THB" },
    ]),
  } satisfies Pick<
    WiseApiClient,
    "getPersonalProfileId" | "listActivities" | "getCardTransactionDebits"
  >;
}

let fakeApi: ReturnType<typeof createFakeApi>;

vi.mock("../wise/wise-api", () => ({
  WiseApiClient: vi.fn(function () {
    return fakeApi;
  }),
}));

// Seeded fixtures are from 2025, synced ones from 2026
async function getSyncedTransactions(accountId: string) {
  return getDb()
    .select()
    .from(transactionTable)
    .where(
      and(
        eq(transactionTable.accountId, accountId),
        gte(transactionTable.createdAt, new Date("2026-01-01")),
      ),
    )
    .orderBy(transactionTable.createdAt);
}

async function getConnection() {
  const [connection] = await getDb()
    .select()
    .from(bankConnectionTable)
    .where(eq(bankConnectionTable.id, connectionId));
  return connection;
}

describe("syncBankConnections", () => {
  setUpDbTest();

  beforeEach(async () => {
    vi.mocked(reportError).mockClear();
    fakeApi = createFakeApi(Object.values(activities));

    const db = getDb();
    await db.insert(bankConnectionTable).values({
      id: connectionId,
      familyId: fixtures.users.alice.id,
      name: "Alice's Wise",
      credentials: { provider: "wise", apiToken: "token" },
    });
    await db.insert(accountTable).values({
      id: thbAccountId,
      familyId: fixtures.users.alice.id,
      name: "Wise THB",
      currency: "THB",
      color: "green",
      bankType: "Wise",
      bankConnectionId: connectionId,
    });
    await db
      .update(accountTable)
      .set({ bankConnectionId: connectionId })
      .where(eq(accountTable.id, fixtures.accounts.accountUsd.id));
  });

  it("imports each balance into the linked account of its currency", async () => {
    await syncBankConnections(getDb(), now);

    expect(await getSyncedTransactions(thbAccountId)).toMatchObject([
      {
        description: "Corner Shop",
        info: "Card transaction of 1,477.75 THB issued by Corner Shop",
        amount: 147775,
        currency: "THB",
        type: "expense",
        externalId: "card-thb",
        createdAt: new Date("2026-11-01T04:18:13.000Z"),
      },
    ]);

    const usd = await getSyncedTransactions(fixtures.accounts.accountUsd.id);
    expect(
      usd.map(({ description, amount, type, isCountable, externalId }) => ({
        description,
        amount,
        type,
        isCountable,
        externalId,
      })),
    ).toEqual([
      {
        // Import rule "Digital Ocean" makes it uncountable
        description: "Sent money to Digital Ocean",
        amount: 878,
        type: "expense",
        isCountable: false,
        externalId: "transfer-usd",
      },
      {
        // The EUR side has no linked account and is skipped
        description: "Converted 8.50 EUR to 10.00 USD",
        amount: 1000,
        type: "income",
        isCountable: true,
        externalId: "conversion",
      },
      {
        description: "Received money from ACME LLC",
        amount: 50000,
        type: "income",
        isCountable: true,
        externalId: "income-usd",
      },
    ]);

    expect(await getConnection()).toMatchObject({
      lastSyncedAt: now,
      lastSyncError: null,
    });
    expect(reportError).not.toHaveBeenCalled();
  });

  it("keeps synced transactions and the user's edits on the next run", async () => {
    await syncBankConnections(getDb(), now);
    const [synced] = await getSyncedTransactions(thbAccountId);
    assert(synced);
    await getDb()
      .update(transactionTable)
      .set({ description: "Groceries", isCountable: false })
      .where(eq(transactionTable.id, synced.id));

    await syncBankConnections(getDb(), new Date(now.getTime() + 86_400_000));

    expect(await getSyncedTransactions(thbAccountId)).toMatchObject([
      { id: synced.id, description: "Groceries", isCountable: false },
    ]);
    expect(
      await getSyncedTransactions(fixtures.accounts.accountUsd.id),
    ).toHaveLength(3);
  });

  it("splits a payment funded from several balances across accounts", async () => {
    fakeApi.listActivities.mockResolvedValue([
      {
        ...activities.thbCardPayment,
        id: "split",
        primaryAmount: "246 THB",
        secondaryAmount: "USD, THB",
      },
    ]);

    await syncBankConnections(getDb(), now);
    await syncBankConnections(getDb(), now);

    expect(fakeApi.getCardTransactionDebits).toHaveBeenCalledOnce();
    expect(await getSyncedTransactions(thbAccountId)).toMatchObject([
      { amount: 7387, externalId: "split" },
    ]);
    expect(
      await getSyncedTransactions(fixtures.accounts.accountUsd.id),
    ).toMatchObject([{ amount: 538, externalId: "split" }]);
  });

  it("removes a synced transaction that was cancelled later", async () => {
    await syncBankConnections(getDb(), now);
    fakeApi.listActivities.mockResolvedValue([
      {
        ...activities.thbCardPayment,
        status: "CANCELLED",
        description: "Cancelled",
      },
    ]);

    await syncBankConnections(getDb(), now);

    expect(await getSyncedTransactions(thbAccountId)).toEqual([]);
  });

  it("records and reports a failed sync", async () => {
    fakeApi.getPersonalProfileId.mockRejectedValue(new Error("Wise API 401"));

    await syncBankConnections(getDb(), now);

    expect(await getConnection()).toMatchObject({
      lastSyncedAt: null,
      lastSyncError: "Wise API 401",
    });
    expect(reportError).toHaveBeenCalledWith(
      "Bank sync failed",
      expect.any(Error),
      {
        connection: `Alice's Wise (${connectionId})`,
        family: fixtures.users.alice.id,
      },
    );
  });

  it("reports credentials that don't match any provider", async () => {
    await getDb()
      .update(bankConnectionTable)
      .set({ credentials: { provider: "wise" } })
      .where(eq(bankConnectionTable.id, connectionId));

    await syncBankConnections(getDb(), now);

    expect(fakeApi.listActivities).not.toHaveBeenCalled();
    expect(reportError).toHaveBeenCalledOnce();
    expect((await getConnection())?.lastSyncError).toBeTruthy();
  });
});
