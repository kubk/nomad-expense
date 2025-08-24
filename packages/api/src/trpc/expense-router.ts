import { z } from "zod";
import { eq, and, or, desc, gte, lte, inArray } from "drizzle-orm";
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
        date: transactionTable.date,
      })
      .from(transactionTable)
      .innerJoin(accountTable, eq(transactionTable.accountId, accountTable.id))
      .where(
        and(
          eq(accountTable.userId, userId),
          // Only expenses (negative amounts)
          // Note: usdAmount is stored as negative for expenses
        ),
      )
      .all();

    // Get recent transactions
    const recentTransactions = await db
      .select({
        id: transactionTable.id,
        description: transactionTable.description,
        amount: transactionTable.amount,
        currency: transactionTable.currency,
        usdAmount: transactionTable.usdAmount,
        date: transactionTable.date,
        accountId: accountTable.id,
      })
      .from(transactionTable)
      .innerJoin(accountTable, eq(transactionTable.accountId, accountTable.id))
      .where(eq(accountTable.userId, userId))
      .orderBy(desc(transactionTable.date))
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
      // Only include expenses (negative amounts)
      if (transaction.usdAmount >= 0) return;

      const date = new Date(transaction.date);
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

      // Add absolute value of expense (convert negative to positive)
      monthlyTotals[monthKey].amount += Math.abs(transaction.usdAmount);
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
      recentTransactions: recentTransactions.map((t) => ({
        id: t.id,
        desc: t.description,
        amount: t.amount,
        currency: t.currency,
        usd: t.usdAmount,
        date: t.date,
        accountId: t.accountId,
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
        const currentDate = new Date();
        const pastDate = new Date();
        pastDate.setMonth(currentDate.getMonth() - input.date.value);
        conditions.push(
          gte(transactionTable.date, pastDate.toISOString().split("T")[0]),
        );
      } else if (input.date.type === "custom") {
        // Custom year-month filter
        if (input.date.value.length > 0) {
          const monthConditions = input.date.value.map(({ year, month }) => {
            const monthStr = month.toString().padStart(2, "0");
            const lastDay = new Date(year, month, 0).getDate();
            return and(
              gte(transactionTable.date, `${year}-${monthStr}-01`),
              lte(
                transactionTable.date,
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
          date: transactionTable.date,
          accountId: accountTable.id,
        })
        .from(transactionTable)
        .innerJoin(
          accountTable,
          eq(transactionTable.accountId, accountTable.id),
        )
        .where(and(...conditions))
        .all();

      // Filter only expenses and group by month
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

      transactions.forEach((transaction) => {
        // Only include expenses (negative amounts)
        if (transaction.usdAmount >= 0) return;

        const date = new Date(transaction.date);
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

        monthlyTotals[monthKey].amount += Math.abs(transaction.usdAmount);
      });

      // Convert to array and sort by newest first
      const filteredMonthlyData = Object.keys(monthlyTotals)
        .map((monthKey) => {
          const monthData = monthlyTotals[monthKey];
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

      return {
        data: filteredMonthlyData,
        maxAmount,
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
        const currentDate = new Date();
        const pastDate = new Date();
        pastDate.setMonth(currentDate.getMonth() - input.date.value);
        conditions.push(
          gte(transactionTable.date, pastDate.toISOString().split("T")[0]),
        );
      } else if (input.date.type === "custom") {
        // Custom year-month filter
        if (input.date.value.length > 0) {
          const monthConditions = input.date.value.map(({ year, month }) => {
            const monthStr = month.toString().padStart(2, "0");
            const lastDay = new Date(year, month, 0).getDate();
            return and(
              gte(transactionTable.date, `${year}-${monthStr}-01`),
              lte(
                transactionTable.date,
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
          date: transactionTable.date,
          accountId: accountTable.id,
        })
        .from(transactionTable)
        .innerJoin(
          accountTable,
          eq(transactionTable.accountId, accountTable.id),
        )
        .where(and(...conditions))
        .orderBy(desc(transactionTable.date))
        .all();

      // Calculate total for filtered transactions (expenses only)
      const totalInUSD = transactions.reduce((sum, t) => {
        // Only include expenses (negative amounts) in the total
        if (t.usdAmount >= 0) return sum; // Skip income transactions
        // Return absolute value of expense amount in USD cents
        return sum + Math.abs(t.usdAmount);
      }, 0);

      return {
        transactions: transactions.map((t) => ({
          id: t.id,
          desc: t.description,
          amount: t.amount,
          currency: t.currency,
          usd: t.usdAmount,
          date: t.date,
          accountId: t.accountId,
        })),
        totalInUSD,
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
          date: transactionTable.date,
          accountId: accountTable.id,
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
        date: transaction.date,
        accountId: transaction.accountId,
      };
    }),

  updateTransaction: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        description: z.string().min(1),
        amount: z.number(),
        date: z.string().optional(),
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

      const updateData: any = {
        description: input.description,
        amount: amountInCents,
        usdAmount: usdAmountInCents,
      };

      if (input.date) {
        updateData.date = input.date;
      }

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
        date: z.string(),
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
        date: input.date,
      });

      return { success: true };
    }),
});
