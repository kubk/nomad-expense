import { z } from "zod";
import { eq, and, or, desc, gte, lte, inArray, sql, ilike } from "drizzle-orm";
import { DateTime } from "luxon";
import { protectedProcedure, t } from "./trpc";
import { transactionTable, accountTable } from "../db/schema";
import { getDb, type DB } from "../services/db";
import { transactionTypeSchema } from "../db/enums";
import { getAccountByFamilyId } from "../db/account/can-acess-account";
import { TRPCError } from "@trpc/server";
import { createMoneyFull } from "../services/money/money";

const transactionFilterSchema = z.object({
  accounts: z.array(z.string()),
  description: z.optional(
    z.object({
      input: z.string(),
      type: z.enum(["includes", "exact"]),
    }),
  ),
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
  order: z.object({
    field: z.enum(["createdAt", "amount"]),
    direction: z.enum(["asc", "desc"]),
  }),
});

const getFilteredTransactions = async (
  input: z.infer<typeof transactionFilterSchema>,
  familyId: string,
  db: DB,
) => {
  // Build query conditions
  const conditions = [eq(accountTable.familyId, familyId)];

  // Account filter
  conditions.push(inArray(accountTable.id, input.accounts));

  // Description filter
  if (input.description) {
    if (input.description.type === "exact") {
      conditions.push(
        eq(transactionTable.description, input.description.input),
      );
    } else if (input.description.type === "includes") {
      conditions.push(
        ilike(transactionTable.description, `%${input.description.input}%`),
      );
    }
  }

  // Date filter
  if (input.date.type === "months") {
    // Recent N months filter
    let dateFilter;
    if (input.date.value === 1) {
      dateFilter = sql`${transactionTable.createdAt} >= NOW() - INTERVAL '1 month'`;
    } else if (input.date.value === 3) {
      dateFilter = sql`${transactionTable.createdAt} >= NOW() - INTERVAL '3 months'`;
    } else if (input.date.value === 6) {
      dateFilter = sql`${transactionTable.createdAt} >= NOW() - INTERVAL '6 months'`;
    } else if (input.date.value === 12) {
      dateFilter = sql`${transactionTable.createdAt} >= NOW() - INTERVAL '12 months'`;
    }
    if (dateFilter) conditions.push(dateFilter);
  } else if (input.date.type === "custom") {
    // Custom year-month filter
    if (input.date.value.length > 0) {
      const monthConditions = input.date.value.map(({ year, month }) => {
        const startDate = DateTime.fromObject({ year, month, day: 1 });
        const endDate = startDate.endOf("month");

        return and(
          gte(transactionTable.createdAt, startDate.toJSDate()),
          lte(transactionTable.createdAt, endDate.toJSDate()),
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

  return db
    .select({
      id: transactionTable.id,
      description: transactionTable.description,
      amount: transactionTable.amount,
      currency: transactionTable.currency,
      usdAmount: transactionTable.usdAmount,
      createdAt: transactionTable.createdAt,
      accountId: accountTable.id,
      type: transactionTable.type,
      isCountable: transactionTable.isCountable,
    })
    .from(transactionTable)
    .innerJoin(accountTable, eq(transactionTable.accountId, accountTable.id))
    .where(and(...conditions));
};

export const expenseRouter = t.router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const familyId = ctx.familyId;

    const allTransactionsDb = db
      .select({
        usdAmount: transactionTable.usdAmount,
        createdAt: transactionTable.createdAt,
      })
      .from(transactionTable)
      .innerJoin(accountTable, eq(transactionTable.accountId, accountTable.id))
      .where(
        and(
          eq(accountTable.familyId, familyId),
          eq(transactionTable.type, "expense"),
          eq(transactionTable.isCountable, true),
        ),
      );

    const last30ExpensesDb = db
      .select({
        total: sql<number>`COALESCE(SUM(${transactionTable.usdAmount}), 0)`,
      })
      .from(transactionTable)
      .innerJoin(accountTable, eq(transactionTable.accountId, accountTable.id))
      .where(
        and(
          eq(accountTable.familyId, familyId),
          eq(transactionTable.type, "expense"),
          eq(transactionTable.isCountable, true),
          sql`${transactionTable.createdAt} >= NOW() - INTERVAL '30 days'`,
        ),
      );

    const recentTransactionsDb = db
      .select({
        id: transactionTable.id,
        description: transactionTable.description,
        amount: transactionTable.amount,
        currency: transactionTable.currency,
        usdAmount: transactionTable.usdAmount,
        createdAt: transactionTable.createdAt,
        accountId: accountTable.id,
        type: transactionTable.type,
        isCountable: transactionTable.isCountable,
      })
      .from(transactionTable)
      .innerJoin(accountTable, eq(transactionTable.accountId, accountTable.id))
      .where(eq(accountTable.familyId, familyId))
      .orderBy(desc(transactionTable.createdAt))
      .limit(3);

    const [allTransactions, last30DaysResult, recentTransactions] =
      await Promise.all([
        allTransactionsDb,
        last30ExpensesDb,
        recentTransactionsDb,
      ]);

    const last30DaysTotal = last30DaysResult[0]?.total || 0;

    // Group transactions by month/year for overview
    const monthlyTotals: {
      [key: string]: {
        usdAmount: number;
        year: number;
        month: number;
        shortMonth: string;
      };
    } = {};

    allTransactions.forEach((transaction) => {
      const dt = DateTime.fromJSDate(transaction.createdAt);
      const monthKey = dt.toFormat("MMM yyyy");
      const shortMonth = dt.toFormat("MMM");
      const year = dt.year;
      const month = dt.month;

      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = {
          usdAmount: 0,
          year,
          month,
          shortMonth,
        };
      }

      monthlyTotals[monthKey].usdAmount += transaction.usdAmount;
    });

    // Convert to array and sort chronologically
    const monthlyData = Object.values(monthlyTotals)
      .sort((a, b) => {
        const yearDiff = a.year - b.year;
        if (yearDiff !== 0) return yearDiff;
        return a.month - b.month;
      })
      .map((monthData) => ({
        month: `${monthData.shortMonth} ${monthData.year}`,
        shortMonth: monthData.shortMonth,
        monthNumber: monthData.month,
        usdAmount: monthData.usdAmount,
        year: monthData.year,
      }));

    return {
      overview: {
        data: monthlyData,
      },
      last30DaysTotal,
      recentTransactions,
    };
  }),

  transactionsByMonth: protectedProcedure
    .input(transactionFilterSchema)
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const familyId = ctx.familyId;

      const transactions = await getFilteredTransactions(input, familyId, db);

      // Group transactions by month (expenses and income separately)
      const monthlyExpenseTotals: {
        [key: string]: {
          usdAmount: number;
          year: number;
          month: number;
          shortMonth: string;
        };
      } = {};
      const monthlyIncomeTotals: {
        [key: string]: {
          usdAmount: number;
          year: number;
          month: number;
          shortMonth: string;
        };
      } = {};

      transactions.forEach((transaction) => {
        if (!transaction.isCountable) return;

        const dt = DateTime.fromJSDate(transaction.createdAt);
        const monthKey = dt.toFormat("MMM yyyy");
        const shortMonth = dt.toFormat("MMM");
        const year = dt.year;
        const month = dt.month;

        if (transaction.type === "expense") {
          if (!monthlyExpenseTotals[monthKey]) {
            monthlyExpenseTotals[monthKey] = {
              usdAmount: 0,
              year,
              month,
              shortMonth,
            };
          }
          monthlyExpenseTotals[monthKey].usdAmount += transaction.usdAmount;
        } else if (transaction.type === "income") {
          if (!monthlyIncomeTotals[monthKey]) {
            monthlyIncomeTotals[monthKey] = {
              usdAmount: 0,
              year,
              month,
              shortMonth,
            };
          }
          monthlyIncomeTotals[monthKey].usdAmount += transaction.usdAmount;
        }
      });

      // Convert to array and sort based on order filter (expenses only for main data)
      const filteredMonthlyData = Object.values(monthlyExpenseTotals)
        .map((monthData) => ({
          month: `${monthData.shortMonth} ${monthData.year}`,
          shortMonth: monthData.shortMonth,
          monthNumber: monthData.month,
          usdAmount: Math.round(monthData.usdAmount),
          year: monthData.year,
        }))
        .sort((a, b) => {
          let comparison = 0;

          if (input.order.field === "createdAt") {
            // Sort by year first, then by month
            if (a.year !== b.year) {
              comparison = a.year - b.year;
            } else {
              comparison = a.monthNumber - b.monthNumber;
            }
          } else if (input.order.field === "amount") {
            comparison = a.usdAmount - b.usdAmount;
          }

          return input.order.direction === "desc" ? -comparison : comparison;
        });

      // Calculate totals for the filtered period
      const totalExpenses = Object.values(monthlyExpenseTotals).reduce(
        (sum, monthData) => sum + monthData.usdAmount,
        0,
      );

      const totalIncome = Object.values(monthlyIncomeTotals).reduce(
        (sum, monthData) => sum + monthData.usdAmount,
        0,
      );

      return {
        data: filteredMonthlyData,
        totalExpenses,
        totalIncome,
      };
    }),

  transactionsList: protectedProcedure
    .input(transactionFilterSchema)
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const familyId = ctx.familyId;

      const transactions = (
        await getFilteredTransactions(input, familyId, db)
      ).sort((a, b) => {
        let comparison = 0;

        if (input.order.field === "createdAt") {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          comparison = dateA - dateB;
        } else if (input.order.field === "amount") {
          comparison = a.usdAmount - b.usdAmount;
        }

        return input.order.direction === "desc" ? -comparison : comparison;
      });

      const totalExpenses = transactions.reduce((sum, t) => {
        if (t.type !== "expense" || !t.isCountable) return sum;
        return sum + t.usdAmount;
      }, 0);

      const totalIncome = transactions.reduce((sum, t) => {
        if (t.type !== "income" || !t.isCountable) return sum;
        return sum + t.usdAmount;
      }, 0);

      return {
        transactions,
        totalExpenses,
        totalIncome,
      };
    }),

  getTransaction: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const familyId = ctx.familyId;

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
          isCountable: transactionTable.isCountable,
        })
        .from(transactionTable)
        .innerJoin(
          accountTable,
          eq(transactionTable.accountId, accountTable.id),
        )
        .where(
          and(
            eq(transactionTable.id, input.id),
            eq(accountTable.familyId, familyId),
          ),
        );

      const transactionResult = transaction[0];
      if (!transactionResult) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return transactionResult;
    }),

  updateTransaction: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        description: z.string().min(1),
        amount: z.number(),
        createdAt: z.string(),
        type: transactionTypeSchema,
        isCountable: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const familyId = ctx.familyId;

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
            eq(accountTable.familyId, familyId),
          ),
        );

      const existingTransactionResult = existingTransaction[0];
      if (!existingTransactionResult) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const money = createMoneyFull({
        amount: { amountHuman: input.amount },
        currency: existingTransactionResult.currency,
      });

      await db
        .update(transactionTable)
        .set({
          description: input.description,
          amount: money.amountCents,
          usdAmount: money.baseAmountCents,
          createdAt: new Date(input.createdAt),
          type: input.type,
          isCountable: input.isCountable,
        })
        .where(eq(transactionTable.id, input.id));

      return { success: true };
    }),

  deleteTransaction: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const familyId = ctx.familyId;

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
            eq(accountTable.familyId, familyId),
          ),
        );

      const existingTransactionResult = existingTransaction[0];
      if (!existingTransactionResult) {
        throw new TRPCError({ code: "NOT_FOUND" });
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
        type: transactionTypeSchema,
        createdAt: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const familyId = ctx.familyId;

      const accountResult = await getAccountByFamilyId(
        db,
        input.accountId,
        familyId,
      );
      if (accountResult.type === "notFound") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const account = accountResult.account;

      const money = createMoneyFull({
        amount: { amountHuman: input.amount },
        currency: account.currency,
      });

      await db.insert(transactionTable).values({
        accountId: input.accountId,
        description: input.description,
        amount: money.amountCents,
        currency: account.currency,
        usdAmount: money.baseAmountCents,
        type: input.type,
        createdAt: input.createdAt ? new Date(input.createdAt) : undefined,
      });

      return { success: true };
    }),
});
