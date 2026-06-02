import { expect, it, describe, vi } from "vitest";
import { eq } from "drizzle-orm";
import { setUpDbTest, fixtures } from "../lib/testing/set-up-db-test";
import { getCaller } from "../lib/testing/get-trpc-caller";
import { getDb } from "../services/db";
import { transactionTable } from "../db/schema";
import { convertWithLiveRate } from "../services/money/exchange-rate-api";

vi.mock("cloudflare:workers", () => ({
  env: {},
}));

vi.mock("../services/money/exchange-rate-api", () => ({
  convertWithLiveRate: vi.fn(
    async (
      amountInCents: number,
      fromCurrency: string,
      toCurrency: string,
    ) => {
      if (fromCurrency === toCurrency) {
        return amountInCents;
      }

      if (fromCurrency === "THB" && toCurrency === "USD") {
        return 14142;
      }

      return 0;
    },
  ),
}));

describe("transaction router", () => {
  setUpDbTest();

  it("updates mixed-currency account transactions using the transaction currency", async () => {
    const db = getDb();
    const transactionId = "5e6dd271-8a8d-46e9-a7d2-01e1083f90fe";
    const createdAt = new Date("2026-05-23T17:00:00.000Z");
    const updatedCreatedAt = "2026-05-24T17:00:00.000Z";

    await db.insert(transactionTable).values({
      id: transactionId,
      accountId: fixtures.accounts.accountUsd.id,
      description: "WWW.2C2P.COM*LAZADA PAY",
      amount: 455900,
      currency: "THB",
      usdAmount: 455900,
      type: "expense",
      source: "imported",
      isCountable: true,
      createdAt,
    });

    const caller = await getCaller({ loginAs: "alice" });

    await caller.expenses.updateTransaction({
      id: transactionId,
      description: "WWW.2C2P.COM*LAZADA PAY",
      amount: 4559,
      createdAt: updatedCreatedAt,
      type: "expense",
      isCountable: true,
    });

    const updatedTransactions = await db
      .select({
        amount: transactionTable.amount,
        currency: transactionTable.currency,
        usdAmount: transactionTable.usdAmount,
      })
      .from(transactionTable)
      .where(eq(transactionTable.id, transactionId));

    expect(updatedTransactions[0]).toEqual({
      amount: 455900,
      currency: "THB",
      usdAmount: 14142,
    });
    expect(vi.mocked(convertWithLiveRate)).toHaveBeenLastCalledWith(
      455900,
      "THB",
      "USD",
      new Date(updatedCreatedAt),
    );
  });
});
