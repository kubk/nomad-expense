import { expect, it, describe, vi } from "vitest";
import { setUpDbTest, fixtures, testNow } from "../lib/testing/set-up-db-test";
import {
  uploadStatementHandler,
  type UploadHandlerResponse,
} from "./upload-statement-handler";
import { getUserById } from "../db/user/get-user-by-id";
import { assert } from "../lib/typescript/assert";
import { getRowCount } from "../lib/testing/get-row-count";
import { transactionTable } from "../db/schema";

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
      expect(responseData.added).toBe(5);
      expect(responseData.removed).toBe(2);
      expect(transactionCountAfter).toBe(
        transactionCountBefore + responseData.added - responseData.removed,
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
      expect(responseData.added).toBe(3);
      expect(responseData.removed).toBe(0);
      expect(transactionCountAfter).toBe(transactionCountBefore + 3);
    }
  });
});
