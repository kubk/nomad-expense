import { expect, it, describe, vi, beforeEach } from "vitest";
import { setUpDbTest, fixtures } from "../lib/testing/set-up-db-test";
import { getCaller } from "../lib/testing/get-trpc-caller";
import { notifyViaTelegram } from "../services/notifications/notify-via-telegram";
import { getDb } from "../services/db";
import { userTable, transactionTable, accountTable } from "../db/schema";
import { eq } from "drizzle-orm";

vi.mock("../services/notifications/notify-via-telegram", () => ({
  notifyViaTelegram: vi.fn(),
}));

vi.mock("cloudflare:workers", () => ({
  env: {},
}));

vi.mock("../services/user-cache", () => ({
  userCacheSet: vi.fn(),
}));

// Mock the exchange rate API to avoid actual HTTP calls in tests
vi.mock("../services/money/exchange-rate-api", () => ({
  fetchExchangeRate: vi.fn().mockResolvedValue(0.92), // USD to EUR rate
  convertWithLiveRate: vi
    .fn()
    .mockImplementation(async (amountInCents, fromCurrency, toCurrency) => {
      if (fromCurrency === toCurrency) return amountInCents;
      // Simple mock: multiply by 0.92 for any conversion (simulating USD to EUR)
      return Math.round(amountInCents * 0.92);
    }),
}));

describe("family router", () => {
  setUpDbTest();

  it("should return list of family members", async () => {
    const callerAlice = await getCaller({ loginAs: "alice" });
    const resultAlice = await callerAlice.family.listMembers();
    expect(resultAlice).toHaveLength(2);

    const callerCharlie = await getCaller({ loginAs: "charlie" });
    const resultCharlie = await callerCharlie.family.listMembers();
    expect(resultCharlie).toHaveLength(1);
  });

  it("should notify family owner when a new member joins", async () => {
    // Alice is the family owner, Bob is already in the family
    // Charlie will join Alice's family
    const callerAlice = await getCaller({ loginAs: "alice" });
    const callerCharlie = await getCaller({ loginAs: "charlie" });

    // Alice generates an invite
    const invite = await callerAlice.family.generateInvite();
    expect(invite.code).toBeDefined();

    // Clear any previous mock calls
    vi.mocked(notifyViaTelegram).mockClear();

    // Charlie joins using the invite code
    const joinResult = await callerCharlie.family.joinFamily({
      code: invite.code,
    });

    expect(joinResult.success).toBe(true);

    // Verify the family now has 3 members
    const familyMembers = await callerAlice.family.listMembers();
    expect(familyMembers).toHaveLength(3);

    // Verify notification was sent to the family owner (Alice)
    expect(notifyViaTelegram).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "userJoinedYourFamily",
      }),
    );
  });

  describe("base currency", () => {
    it("should return default base currency (USD)", async () => {
      const callerAlice = await getCaller({ loginAs: "alice" });
      const baseCurrency = await callerAlice.family.getBaseCurrency();
      expect(baseCurrency).toBe("USD");
    });

    it("should update base currency for all family members", async () => {
      const callerAlice = await getCaller({ loginAs: "alice" });
      const callerBob = await getCaller({ loginAs: "bob" });

      // Update base currency to EUR
      const result = await callerAlice.family.updateBaseCurrency({
        baseCurrency: "EUR",
      });
      expect(result.success).toBe(true);

      // Both Alice and Bob should now have EUR as base currency
      const aliceBaseCurrency = await callerAlice.family.getBaseCurrency();
      const bobBaseCurrency = await callerBob.family.getBaseCurrency();

      expect(aliceBaseCurrency).toBe("EUR");
      expect(bobBaseCurrency).toBe("EUR");

      // Charlie (different family) should still have USD
      const callerCharlie = await getCaller({ loginAs: "charlie" });
      const charlieBaseCurrency = await callerCharlie.family.getBaseCurrency();
      expect(charlieBaseCurrency).toBe("USD");
    });

    it("should recalculate all transactions when base currency changes", async () => {
      const db = getDb();
      const callerAlice = await getCaller({ loginAs: "alice" });

      // Get initial USD amounts
      const transactionsBefore = await db
        .select({
          id: transactionTable.id,
          amount: transactionTable.amount,
          usdAmount: transactionTable.usdAmount,
        })
        .from(transactionTable)
        .innerJoin(
          accountTable,
          eq(transactionTable.accountId, accountTable.id),
        )
        .where(eq(accountTable.familyId, fixtures.users.alice.id));

      // Update to EUR and recalculate
      await callerAlice.family.updateBaseCurrency({ baseCurrency: "EUR" });
      const recalcResult = await callerAlice.family.recalculateTransactions();

      expect(recalcResult.success).toBe(true);
      expect(recalcResult.updatedCount).toBe(transactionsBefore.length);
      expect(recalcResult.totalCount).toBe(transactionsBefore.length);

      // Verify amounts have been updated (mock converts by multiplying 0.92)
      const transactionsAfter = await db
        .select({
          id: transactionTable.id,
          amount: transactionTable.amount,
          usdAmount: transactionTable.usdAmount,
        })
        .from(transactionTable)
        .innerJoin(
          accountTable,
          eq(transactionTable.accountId, accountTable.id),
        )
        .where(eq(accountTable.familyId, fixtures.users.alice.id));

      // Find one transaction and verify the amount changed
      // The mock converts transaction.amount (the original amount in cents) by multiplying 0.92
      const beforeTx = transactionsBefore[0];
      const afterTx = transactionsAfter.find((t) => t.id === beforeTx.id);

      // The mock multiplies the original amount by 0.92
      expect(afterTx?.usdAmount).toBe(Math.round(beforeTx.amount * 0.92));
    });
  });
});
