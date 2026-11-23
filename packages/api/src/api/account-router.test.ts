import { expect, it, describe } from "vitest";
import { setUpDbTest, fixtures, testNow } from "../lib/testing/set-up-db-test";
import { getCaller } from "../lib/testing/get-trpc-caller";
import { getDb } from "../services/db";
import { accountTable, transactionTable } from "../db/schema";

describe("account router", () => {
  setUpDbTest();

  it("lists each account with its own last transaction date and recent manual count", async () => {
    const db = getDb();
    const emptyAccountId = "0b6f6a43-3f4e-4f43-9a51-5d0c7c7e2a10";
    const recentManualDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentImportedDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    await db.insert(accountTable).values({
      id: emptyAccountId,
      familyId: fixtures.users.alice.id,
      name: "Empty",
      currency: "EUR",
      color: "orange",
      sort: 1,
    });

    const transaction = {
      accountId: fixtures.accounts.accountUsd.id,
      description: "Coffee",
      amount: 500,
      currency: "USD" as const,
      usdAmount: 500,
    };
    await db.insert(transactionTable).values([
      { ...transaction, source: "manual", createdAt: recentManualDate },
      { ...transaction, source: "imported", createdAt: recentImportedDate },
    ]);

    const caller = await getCaller({ loginAs: "alice" });
    const accounts = await caller.accounts.list();

    const byId = new Map(accounts.map((account) => [account.id, account]));
    expect(accounts).toHaveLength(3);
    expect(byId.get(fixtures.accounts.accountUsd.id)).toMatchObject({
      lastTransactionDate: recentManualDate,
      recentManualCount: 1,
    });
    // The seeded manual transaction is older than three months.
    expect(byId.get(fixtures.accounts.accountTry.id)).toMatchObject({
      lastTransactionDate: testNow.toJSDate(),
      recentManualCount: 0,
    });
    expect(byId.get(emptyAccountId)).toMatchObject({
      lastTransactionDate: null,
      recentManualCount: 0,
    });
  });
});
