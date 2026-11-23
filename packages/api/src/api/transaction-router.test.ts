import { expect, it, describe, vi } from "vitest";
import { DateTime } from "luxon";
import { eq } from "drizzle-orm";
import { setUpDbTest, fixtures } from "../lib/testing/set-up-db-test";
import { getCaller } from "../lib/testing/get-trpc-caller";
import { getDb } from "../services/db";
import { transactionTable } from "../db/schema";
import { convertWithLiveRate } from "../services/money/exchange-rate-api";

vi.mock("../services/money/exchange-rate-api", () => ({
  convertWithLiveRate: vi.fn(
    async (amountInCents: number, fromCurrency: string, toCurrency: string) => {
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

  it("lists every family account when the filter omits accounts", async () => {
    const caller = await getCaller({ loginAs: "alice" });
    const baseFilters = {
      date: { type: "all" as const },
      order: { field: "createdAt" as const, direction: "desc" as const },
    };

    const omitted = await caller.expenses.transactionsList(baseFilters);
    const explicit = await caller.expenses.transactionsList({
      ...baseFilters,
      accounts: [
        fixtures.accounts.accountTry.id,
        fixtures.accounts.accountUsd.id,
      ],
    });
    const tryOnly = await caller.expenses.transactionsList({
      ...baseFilters,
      accounts: [fixtures.accounts.accountTry.id],
    });

    const ids = (result: typeof omitted) =>
      result.transactions.map((transaction) => transaction.id).sort();
    expect(ids(omitted)).toEqual(ids(explicit));
    expect(ids(tryOnly).length).toBeGreaterThan(0);
    expect(ids(tryOnly).length).toBeLessThan(ids(omitted).length);
  });

  it("leaves accounts excluded from the monthly breakdown out of it even when the filter lists them", async () => {
    const caller = await getCaller({ loginAs: "alice" });
    const filters = {
      accounts: [
        fixtures.accounts.accountTry.id,
        fixtures.accounts.accountUsd.id,
      ],
      date: { type: "all" as const },
      order: { field: "createdAt" as const, direction: "desc" as const },
    };

    // Income only exists on the USD account
    const before = await caller.expenses.transactionsByMonth(filters);
    expect(before.totalIncome).toBeGreaterThan(0);

    await caller.family.updateMonthlyBreakdownExcludedAccountIds({
      excludedAccountIds: [fixtures.accounts.accountUsd.id],
    });

    const listed = await caller.expenses.transactionsByMonth(filters);
    const omitted = await caller.expenses.transactionsByMonth({
      ...filters,
      accounts: undefined,
    });
    const tryOnly = await caller.expenses.transactionsByMonth({
      ...filters,
      accounts: [fixtures.accounts.accountTry.id],
    });

    expect(listed.totalIncome).toBe(0);
    expect(listed).toEqual(tryOnly);
    expect(omitted).toEqual(tryOnly);
    expect(tryOnly.totalExpenses).toBeGreaterThan(0);
  });

  it("overview pages the latest expense months across gaps and shows the newest transactions of any account", async () => {
    const db = getDb();
    const monthStart = DateTime.utc().startOf("month").plus({ days: 1 });
    // A ten-month gap pushes the page's older months far behind the latest ones
    const expenseMonthsAgo = [0, 1, 12, 13, 14, 15, 16, 17, 18];
    const transaction = {
      accountId: fixtures.accounts.accountUsd.id,
      description: "Groceries",
      amount: 1000,
      currency: "USD" as const,
      usdAmount: 1000,
    };
    await db.insert(transactionTable).values(
      expenseMonthsAgo.map((monthsAgo) => ({
        ...transaction,
        usdAmount: 1000 + monthsAgo,
        createdAt: monthStart.minus({ months: monthsAgo }).toJSDate(),
      })),
    );
    // Income stays out of the breakdown but is the newest activity
    const now = DateTime.utc().startOf("second");
    const inDays = (days: number) => now.plus({ days }).toJSDate();
    await db.insert(transactionTable).values([
      { ...transaction, type: "income", createdAt: inDays(3) },
      { ...transaction, type: "income", createdAt: inDays(2) },
      {
        ...transaction,
        accountId: fixtures.accounts.accountTry.id,
        currency: "TRY",
        type: "income",
        createdAt: inDays(1),
      },
    ]);

    const caller = await getCaller({ loginAs: "alice" });
    const overview = await caller.expenses.overview({ cursor: 0 });

    expect(
      overview.overview.data.map(({ year, monthNumber, usdAmount }) => ({
        year,
        monthNumber,
        usdAmount,
      })),
    ).toEqual(
      [17, 16, 15, 14, 13, 12, 1, 0].map((monthsAgo) => {
        const month = monthStart.minus({ months: monthsAgo });
        return {
          year: month.year,
          monthNumber: month.month,
          usdAmount: 1000 + monthsAgo,
        };
      }),
    );
    expect(overview.overview.previousCursor).toBe(1);
    expect(
      overview.recentTransactions.map(({ accountId, createdAt }) => ({
        accountId,
        createdAt,
      })),
    ).toEqual([
      { accountId: fixtures.accounts.accountUsd.id, createdAt: inDays(3) },
      { accountId: fixtures.accounts.accountUsd.id, createdAt: inDays(2) },
      { accountId: fixtures.accounts.accountTry.id, createdAt: inDays(1) },
    ]);
  });
});
