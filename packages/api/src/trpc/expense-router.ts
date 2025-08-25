import { z } from "zod";
import { eq, and, or, desc, gte, lte, inArray, sql } from "drizzle-orm";
import { protectedProcedure, t } from "./trpc";
import { transactionTable, accountTable } from "../db/schema";
import { getDb } from "../services/db";
import {
  convert,
  type SupportedCurrency,
} from "../services/currency-converter";

const transactionFilterSchema = z.object({
  accounts: z.array(z.string()),
  date: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("months"),
      value: z.number(),
    }),
    z.object({
      type: z.literal("custom"),
      value: z.array(
        z.object({
          year: z.number(),
          month: z.number().min(1).max(12),
        }),
      ),
    }),
  ]),
});

export const expenseRouter = t.router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    // Get all transactions for the user (for overview chart data)
    const allTransactions = await db
      .select({
        usdAmount: transactionTable.usdAmount,
        createdAt: transactionTable.createdAt,
      })
      .from(transactionTable)
      .innerJoin(accountTable, eq(transactionTable.accountId, accountTable.id))
      .where(
        and(
          eq(accountTable.userId, userId),
          eq(transactionTable.type, "expense"),
        ),
      )
      .all();

    // Get last 30 days expenses total using SQLite date functions
    const last30DaysResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${transactionTable.usdAmount}), 0)`,
      })
      .from(transactionTable)
      .innerJoin(accountTable, eq(transactionTable.accountId, accountTable.id))
      .where(
        and(
          eq(accountTable.userId, userId),
          eq(transactionTable.type, "expense"),
          sql`${transactionTable.createdAt} >= datetime('now', '-30 days')`,
        ),
      )
      .get();

    const last30DaysTotal = last30DaysResult?.total || 0;

    // Get recent transactions
    const recentTransactions = await db
      .select({
        id: transactionTable.id,
        description: transactionTable.description,
        amount: transactionTable.amount,
        currency: transactionTable.currency,
        usdAmount: transactionTable.usdAmount,
        createdAt: transactionTable.createdAt,
        accountId: accountTable.id,
        type: transactionTable.type,
      })
      .from(transactionTable)
      .innerJoin(accountTable, eq(transactionTable.accountId, accountTable.id))
      .where(eq(accountTable.userId, userId))
      .orderBy(desc(transactionTable.createdAt))
      .limit(3)
      .all();

    // Group transactions by month/year for overview
    const monthlyTotals: {
      [key: string]: { amount: number; year: number; shortMonth: string };
    } = {};

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    allTransactions.forEach((transaction) => {
      const date = new Date(transaction.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const shortMonth = monthNames[month - 1];
      const monthKey = `${shortMonth} ${year}`;

      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = {
          amount: 0,
          year,
          shortMonth,
        };
      }

      monthlyTotals[monthKey].amount += transaction.usdAmount;
    });

    // Convert to array and sort chronologically
    const monthlyData = Object.keys(monthlyTotals)
      .sort((a, b) => {
        const [monthA, yearA] = a.split(" ");
        const [monthB, yearB] = b.split(" ");
        const yearDiff = parseInt(yearA) - parseInt(yearB);
        if (yearDiff !== 0) return yearDiff;
        return monthNames.indexOf(monthA) - monthNames.indexOf(monthB);
      })
      .map((monthKey) => {
        const monthData = monthlyTotals[monthKey];

        return {
          month: monthKey,
          shortMonth: monthData.shortMonth,
          monthNumber: monthNames.indexOf(monthData.shortMonth) + 1,
          amount: monthData.amount,
          year: monthData.year,
        };
      });

    const maxAmount = Math.max(...monthlyData.map((m) => m.amount));

    return {
      overview: {
        data: monthlyData,
        maxAmount,
      },
      last30DaysTotal,
      recentTransactions: recentTransactions.map((t) => ({
        id: t.id,
        desc: t.description,
        amount: t.amount,
        currency: t.currency,
        usd: t.usdAmount,
        createdAt: t.createdAt,
        accountId: t.accountId,
        type: t.type,
      })),
    };
  }),

  transactionsByMonth: protectedProcedure
    .input(transactionFilterSchema)
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Build query conditions
      const conditions = [eq(accountTable.userId, userId)];

      // Account filter
      conditions.push(inArray(accountTable.id, input.accounts));

      // Date filter
      if (input.date.type === "months") {
        // Recent N months filter
        let dateFilter;
        if (input.date.value === 1) {
          dateFilter = sql`${transactionTable.createdAt} >= datetime('now', '-1 month')`;
        } else if (input.date.value === 3) {
          dateFilter = sql`${transactionTable.createdAt} >= datetime('now', '-3 months')`;
        } else if (input.date.value === 6) {
          dateFilter = sql`${transactionTable.createdAt} >= datetime('now', '-6 months')`;
        } else if (input.date.value === 12) {
          dateFilter = sql`${transactionTable.createdAt} >= datetime('now', '-12 months')`;
        }
        if (dateFilter) conditions.push(dateFilter);
      } else if (input.date.type === "custom") {
        // Custom year-month filter
        if (input.date.value.length > 0) {
          const monthConditions = input.date.value.map(({ year, month }) => {
            const monthStr = month.toString().padStart(2, "0");
            const lastDay = new Date(year, month, 0).getDate();
            return and(
              gte(transactionTable.createdAt, `${year}-${monthStr}-01`),
              lte(
                transactionTable.createdAt,
                `${year}-${monthStr}-${lastDay.toString().padStart(2, "0")}`,
              ),
            )!; // Non-null assertion since we know and() will return a value
          });

          if (monthConditions.length === 1) {
            conditions.push(monthConditions[0]);
          } else if (monthConditions.length > 1) {
            // Use OR to match any of the specified months
            const orCondition = or(...monthConditions);
            if (orCondition) {
              conditions.push(orCondition);
            }
          }
        }
      }

      const transactions = await db
        .select({
          usdAmount: transactionTable.usdAmount,
          createdAt: transactionTable.createdAt,
          accountId: accountTable.id,
          type: transactionTable.type,
        })
        .from(transactionTable)
        .innerJoin(
          accountTable,
          eq(transactionTable.accountId, accountTable.id),
        )
        .where(and(...conditions))
        .all();

      // Group transactions by month (expenses and income separately)
      const monthlyExpenseTotals: {
        [key: string]: { amount: number; year: number; shortMonth: string };
      } = {};
      const monthlyIncomeTotals: {
        [key: string]: { amount: number; year: number; shortMonth: string };
      } = {};

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      transactions.forEach((transaction) => {
        const date = new Date(transaction.createdAt);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const shortMonth = monthNames[month - 1];
        const monthKey = `${shortMonth} ${year}`;

        if (transaction.type === "expense") {
          if (!monthlyExpenseTotals[monthKey]) {
            monthlyExpenseTotals[monthKey] = {
              amount: 0,
              year,
              shortMonth,
            };
          }
          monthlyExpenseTotals[monthKey].amount += transaction.usdAmount;
        } else if (transaction.type === "income") {
          if (!monthlyIncomeTotals[monthKey]) {
            monthlyIncomeTotals[monthKey] = {
              amount: 0,
              year,
              shortMonth,
            };
          }
          monthlyIncomeTotals[monthKey].amount += transaction.usdAmount;
        }
      });

      // Convert to array and sort by newest first (expenses only for main data)
      const filteredMonthlyData = Object.keys(monthlyExpenseTotals)
        .map((monthKey) => {
          const monthData = monthlyExpenseTotals[monthKey];
          return {
            month: monthKey,
            shortMonth: monthData.shortMonth,
            monthNumber: monthNames.indexOf(monthData.shortMonth) + 1,
            amount: Math.round(monthData.amount),
            year: monthData.year,
          };
        })
        .sort((a, b) => {
          // Sort by year first (descending), then by month (descending)
          if (a.year !== b.year) {
            return b.year - a.year;
          }
          const aMonthIndex = monthNames.indexOf(a.shortMonth);
          const bMonthIndex = monthNames.indexOf(b.shortMonth);
          return bMonthIndex - aMonthIndex;
        });

      const maxAmount = Math.max(
        ...filteredMonthlyData.map((m) => m.amount),
        0,
      );

      // Calculate totals for the filtered period
      const totalExpenses = Object.values(monthlyExpenseTotals).reduce(
        (sum, monthData) => sum + monthData.amount,
        0,
      );

      const totalIncome = Object.values(monthlyIncomeTotals).reduce(
        (sum, monthData) => sum + monthData.amount,
        0,
      );

      return {
        data: filteredMonthlyData,
        maxAmount,
        totalExpenses,
        totalIncome,
      };
    }),

  transactionsList: protectedProcedure
    .input(transactionFilterSchema)
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Build query conditions
      const conditions = [eq(accountTable.userId, userId)];

      // Account filter
      conditions.push(inArray(accountTable.id, input.accounts));

      // Date filter
      if (input.date.type === "months") {
        // Recent N months filter
        let dateFilter;
        if (input.date.value === 1) {
          dateFilter = sql`${transactionTable.createdAt} >= datetime('now', '-1 month')`;
        } else if (input.date.value === 3) {
          dateFilter = sql`${transactionTable.createdAt} >= datetime('now', '-3 months')`;
        } else if (input.date.value === 6) {
          dateFilter = sql`${transactionTable.createdAt} >= datetime('now', '-6 months')`;
        } else if (input.date.value === 12) {
          dateFilter = sql`${transactionTable.createdAt} >= datetime('now', '-12 months')`;
        }
        if (dateFilter) conditions.push(dateFilter);
      } else if (input.date.type === "custom") {
        // Custom year-month filter
        if (input.date.value.length > 0) {
          const monthConditions = input.date.value.map(({ year, month }) => {
            const monthStr = month.toString().padStart(2, "0");
            const lastDay = new Date(year, month, 0).getDate();
            return and(
              gte(transactionTable.createdAt, `${year}-${monthStr}-01`),
              lte(
                transactionTable.createdAt,
                `${year}-${monthStr}-${lastDay.toString().padStart(2, "0")}`,
              ),
            )!; // Non-null assertion since we know and() will return a value
          });

          if (monthConditions.length === 1) {
            conditions.push(monthConditions[0]);
          } else if (monthConditions.length > 1) {
            // Use OR to match any of the specified months
            const orCondition = or(...monthConditions);
            if (orCondition) {
              conditions.push(orCondition);
            }
          }
        }
      }

      const transactions = await db
        .select({
          id: transactionTable.id,
          description: transactionTable.description,
          amount: transactionTable.amount,
          currency: transactionTable.currency,
          usdAmount: transactionTable.usdAmount,
          createdAt: transactionTable.createdAt,
          accountId: accountTable.id,
          type: transactionTable.type,
        })
        .from(transactionTable)
        .innerJoin(
          accountTable,
          eq(transactionTable.accountId, accountTable.id),
        )
        .where(and(...conditions))
        .orderBy(desc(transactionTable.createdAt))
        .all();

      // Calculate totals for filtered transactions (expenses and income separately)
      const totalExpenses = transactions.reduce((sum, t) => {
        if (t.type !== "expense") return sum;
        return sum + t.usdAmount;
      }, 0);

      const totalIncome = transactions.reduce((sum, t) => {
        if (t.type !== "income") return sum;
        return sum + t.usdAmount;
      }, 0);

      return {
        transactions: transactions.map((t) => ({
          id: t.id,
          desc: t.description,
          amount: t.amount,
          currency: t.currency,
          usd: t.usdAmount,
          createdAt: t.createdAt,
          accountId: t.accountId,
          type: t.type,
        })),
        totalExpenses,
        totalIncome,
      };
    }),

  getTransaction: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const transaction = await db
        .select({
          id: transactionTable.id,
          description: transactionTable.description,
          amount: transactionTable.amount,
          currency: transactionTable.currency,
          usdAmount: transactionTable.usdAmount,
          createdAt: transactionTable.createdAt,
          accountId: accountTable.id,
          type: transactionTable.type,
        })
        .from(transactionTable)
        .innerJoin(
          accountTable,
          eq(transactionTable.accountId, accountTable.id),
        )
        .where(
          and(
            eq(transactionTable.id, input.id),
            eq(accountTable.userId, userId),
          ),
        )
        .get();

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      return {
        id: transaction.id,
        desc: transaction.description,
        amount: transaction.amount,
        currency: transaction.currency,
        usd: transaction.usdAmount,
        createdAt: transaction.createdAt,
        accountId: transaction.accountId,
        type: transaction.type,
      };
    }),

  updateTransaction: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        description: z.string().min(1),
        amount: z.number(),
        createdAt: z.string(),
        type: z.enum(["expense", "income"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Verify transaction belongs to user and get account currency
      const existingTransaction = await db
        .select({
          id: transactionTable.id,
          currency: accountTable.currency,
        })
        .from(transactionTable)
        .innerJoin(
          accountTable,
          eq(transactionTable.accountId, accountTable.id),
        )
        .where(
          and(
            eq(transactionTable.id, input.id),
            eq(accountTable.userId, userId),
          ),
        )
        .get();

      if (!existingTransaction) {
        throw new Error("Transaction not found");
      }

      // Convert amount to cents and calculate USD amount
      const amountInCents = Math.round(input.amount * 100);
      const usdAmountInCents = convert(
        amountInCents,
        existingTransaction.currency as SupportedCurrency,
        "USD",
      );

      const updateData = {
        description: input.description,
        amount: amountInCents,
        usdAmount: usdAmountInCents,
        createdAt: input.createdAt,
        type: input.type,
      };

      await db
        .update(transactionTable)
        .set(updateData)
        .where(eq(transactionTable.id, input.id));

      return { success: true };
    }),

  deleteTransaction: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Verify transaction belongs to user
      const existingTransaction = await db
        .select({ id: transactionTable.id })
        .from(transactionTable)
        .innerJoin(
          accountTable,
          eq(transactionTable.accountId, accountTable.id),
        )
        .where(
          and(
            eq(transactionTable.id, input.id),
            eq(accountTable.userId, userId),
          ),
        )
        .get();

      if (!existingTransaction) {
        throw new Error("Transaction not found");
      }

      await db
        .delete(transactionTable)
        .where(eq(transactionTable.id, input.id));

      return { success: true };
    }),

  createTransaction: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        description: z.string().min(1),
        amount: z.number(),
        type: z.enum(["expense", "income"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Verify account belongs to user
      const account = await db
        .select({ currency: accountTable.currency })
        .from(accountTable)
        .where(
          and(
            eq(accountTable.id, input.accountId),
            eq(accountTable.userId, userId),
          ),
        )
        .get();

      if (!account) {
        throw new Error("Account not found");
      }

      // Convert amount to cents and calculate USD amount
      const amountInCents = Math.round(input.amount * 100);
      const usdAmountInCents = convert(
        amountInCents,
        account.currency as SupportedCurrency,
        "USD",
      );

      await db.insert(transactionTable).values({
        accountId: input.accountId,
        description: input.description,
        amount: amountInCents,
        currency: account.currency,
        usdAmount: usdAmountInCents,
        type: input.type,
      });

      return { success: true };
    }),
});
