import { expect, it, describe, vi } from "vitest";
import { eq } from "drizzle-orm";
import { DateTime } from "luxon";
import { setUpDbTest, fixtures, testNow } from "../lib/testing/set-up-db-test";
import {
  uploadStatementHandler,
  type UploadHandlerResponse,
} from "./upload-statement-handler";
import { getUserById } from "../db/user/get-user-by-id";
import { assert } from "../lib/typescript/assert";
import { getRowCount } from "../lib/testing/get-row-count";
import { transactionTable } from "../db/schema";
import { getDb } from "../services/db";
import { getCaller } from "../lib/testing/get-trpc-caller";

vi.mock("../services/auth/authenticate", () => ({
  authenticate: vi.fn(),
}));

function createCsvContent(
  transactions: Array<{
    amount: string;
    merchant?: string;
    description: string;
    daysOffset: number;
  }>,
) {
  const header = "Amount,Currency,Merchant,Description,Date";
  const rows = transactions.map(
    (tx) =>
      `${tx.amount},USD,${tx.merchant || ""},${tx.description},${testNow.minus({ days: tx.daysOffset }).toFormat("dd-MM-yyyy")}`,
  );
  return [header, ...rows].join("\n");
}

function createMockRequest(
  csvContent: string,
  accountId = fixtures.accounts.accountUsd.id,
) {
  const formData = new FormData();
  formData.append("file", new File([csvContent], "test.csv"));
  formData.append("accountId", accountId);

  return new Request("http://localhost:8787/upload-statement", {
    method: "POST",
    headers: new Headers(),
    body: formData,
  });
}

describe("upload-statement-handler", () => {
  setUpDbTest();

  async function setupAuth() {
    const { authenticate } = await import("../services/auth/authenticate");
    const user = await getUserById(fixtures.users.alice.id);
    assert(user);
    vi.mocked(authenticate).mockResolvedValue({
      userId: user.id,
      familyId: user.familyId,
    });
  }

  it("should upload statement with overlapping dates (removes existing)", async () => {
    await setupAuth();

    // Transactions that overlap with existing fixtures (testNow and testNow-4)
    const csvContent = createCsvContent([
      {
        amount: "-25.00",
        merchant: "Coffee Shop",
        description: "Morning coffee",
        daysOffset: 0,
      },
      {
        amount: "-120.75",
        merchant: "Amazon",
        description: "Online shopping",
        daysOffset: 1,
      },
      { amount: "-15.50", description: "Uber ride", daysOffset: 2 },
      {
        amount: "500.00",
        merchant: "Freelance Client",
        description: "Project payment",
        daysOffset: 3,
      },
      {
        amount: "-35.25",
        merchant: "Grocery Store",
        description: "Weekly shopping",
        daysOffset: 4,
      },
    ]);

    const transactionCountBefore = await getRowCount(transactionTable);
    const result = await uploadStatementHandler(createMockRequest(csvContent));
    const transactionCountAfter = await getRowCount(transactionTable);

    const responseData = (await result.json()) as UploadHandlerResponse;

    expect(responseData.type).toBe("success");
    if (responseData.type === "success") {
      expect(responseData.added.length).toBe(5);
      expect(responseData.removed.length).toBe(2);
      expect(transactionCountAfter).toBe(
        transactionCountBefore +
          responseData.added.length -
          responseData.removed.length,
      );
    }
  });

  it("should upload statement with non-overlapping dates (no removals)", async () => {
    await setupAuth();

    // Transactions from future dates (no overlap with existing fixtures)
    const csvContent = createCsvContent([
      {
        amount: "-30.00",
        merchant: "Future Coffee",
        description: "Future coffee",
        daysOffset: -10,
      },
      {
        amount: "-50.00",
        merchant: "Future Store",
        description: "Future purchase",
        daysOffset: -11,
      },
      {
        amount: "200.00",
        merchant: "Future Client",
        description: "Future payment",
        daysOffset: -12,
      },
    ]);

    const transactionCountBefore = await getRowCount(transactionTable);
    const result = await uploadStatementHandler(createMockRequest(csvContent));
    const transactionCountAfter = await getRowCount(transactionTable);

    const responseData = (await result.json()) as UploadHandlerResponse;

    expect(responseData.type).toBe("success");
    if (responseData.type === "success") {
      expect(responseData.added.length).toBe(3);
      expect(responseData.removed.length).toBe(0);
      expect(transactionCountAfter).toBe(transactionCountBefore + 3);
    }
  });

  it("should apply import rules during transaction import", async () => {
    await setupAuth();

    // Create transactions that will trigger the import rules
    // Based on fixtures: "Digital Ocean" rule makes transactions uncountable
    // and " Buy" rule filters description text
    const csvContent = createCsvContent([
      {
        amount: "-50.00",
        merchant: "Migros",
        description: "Migros Buy", // Should become "Migros" (FilterTransactionName rule)
        daysOffset: 1,
      },
      {
        amount: "-100.00",
        merchant: "Digital Ocean",
        description: "Digital Ocean", // Should become uncountable (MakeUncountable rule)
        daysOffset: 2,
      },
      {
        amount: "-25.00",
        merchant: "Regular Store",
        description: "Regular Store", // Should remain unchanged (no matching rules)
        daysOffset: 3,
      },
    ]);

    const transactionCountBefore = await getRowCount(transactionTable);
    const result = await uploadStatementHandler(
      createMockRequest(csvContent, fixtures.accounts.accountUsd.id),
    );
    const transactionCountAfter = await getRowCount(transactionTable);

    const responseData = (await result.json()) as UploadHandlerResponse;

    expect(responseData.type).toBe("success");
    if (responseData.type === "success") {
      expect(responseData.added.length).toBe(3);
      expect(responseData.removed.length).toBe(0); // No overlapping dates with existing USD account transactions
      expect(transactionCountAfter).toBe(
        transactionCountBefore +
          responseData.added.length -
          responseData.removed.length,
      );
    }

    const db = getDb();
    const importedTransactions = await db
      .select()
      .from(transactionTable)
      .where(eq(transactionTable.accountId, fixtures.accounts.accountUsd.id));

    // Filter only imported transactions (not existing ones)
    const newlyImportedTransactions = importedTransactions.filter(
      (t) => t.source === "imported",
    );

    // Check that "Migros Buy" became "Migros" (FilterTransactionName rule applied)
    const migrosTransaction = newlyImportedTransactions.find(
      (t) => t.description === "Migros",
    );
    expect(migrosTransaction).toBeDefined();
    expect(migrosTransaction?.isCountable).toBe(true);

    // Check that transaction with " Buy" was not found (because it was filtered)
    const migrosBuyTransaction = newlyImportedTransactions.find(
      (t) => t.description === "Migros Buy",
    );
    expect(migrosBuyTransaction).toBeUndefined();

    // Check that "Digital Ocean" transaction became uncountable (MakeUncountable rule applied)
    const digitalOceanTransaction = newlyImportedTransactions.find(
      (t) => t.description === "Digital Ocean",
    );
    expect(digitalOceanTransaction).toBeDefined();
    expect(digitalOceanTransaction?.isCountable).toBe(false);

    // Check that non-matching transaction remained unchanged
    const regularStoreTransaction = newlyImportedTransactions.find(
      (t) => t.description === "Regular Store",
    );
    expect(regularStoreTransaction).toBeDefined();
    expect(regularStoreTransaction?.isCountable).toBe(true);
  });

  it("should apply account timezone when importing transactions", async () => {
    await setupAuth();

    const caller = await getCaller({ loginAs: "alice" });

    const createTransactionCsv = () =>
      createCsvContent([
        {
          amount: "-50.00",
          merchant: "Timezone Test Store",
          description: "Timezone test transaction",
          daysOffset: 1,
        },
        {
          amount: "-25.00",
          merchant: "Another Store",
          description: "Another transaction",
          daysOffset: 2,
        },
      ]);

    // Helper function to import transaction with specified timezone
    const importWithTimezone = async (timezone: string) => {
      await caller.accounts.updateImportSettings({
        id: fixtures.accounts.accountUsd.id,
        bankType: "Wise",
        timezone,
      });

      const result = await uploadStatementHandler(
        createMockRequest(createTransactionCsv()),
      );
      const responseData = (await result.json()) as UploadHandlerResponse;

      expect(responseData.type).toBe("success");
      assert(responseData.type === "success", "Upload should succeed");

      const transaction = responseData.added.find(
        (t) => t.description === "Timezone Test Store",
      );
      expect(transaction).toBeDefined();
      assert(transaction, "Transaction should be found in response");

      return transaction;
    };

    const utcTransaction = await importWithTimezone("UTC");

    const bangkokTransaction = await importWithTimezone("Asia/Bangkok");

    const utcDate = DateTime.fromJSDate(new Date(utcTransaction.createdAt));
    const bangkokDate = DateTime.fromJSDate(
      new Date(bangkokTransaction.createdAt),
    );

    expect(utcDate.diff(bangkokDate, "hours").hours).toBe(7);
  });
});
