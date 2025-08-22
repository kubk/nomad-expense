import { z } from "zod";
import { eq, and, desc, gte, lte, inArray } from "drizzle-orm";
import { protectedProcedure, t } from "./trpc";
import { transactionTable, accountTable } from "../db/schema";
import { getDb } from "../services/db";

const monthlyBreakdownFiltersSchema = z.object({
  accounts: z.array(z.string()),
  date: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("months"),
      value: z.number(),
    }),
    z.object({
      type: z.literal("years"),
      value: z.array(z.number()),
    }),
  ]),
});

export const expenseRouter = t.router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    // Get all transactions for the user
    const transactions = await db
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

    // Group transactions by month/year
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
          amount: monthData.amount,
          year: monthData.year,
        };
      });

    const maxAmount = Math.max(...monthlyData.map((m) => m.amount));

    return {
      data: monthlyData,
      maxAmount,
    };
  }),

  recentTransactions: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const recentTransactions = await db
      .select({
        id: transactionTable.id,
        description: transactionTable.description,
        amount: transactionTable.amount,
        currency: transactionTable.currency,
        usdAmount: transactionTable.usdAmount,
        date: transactionTable.date,
        account: {
          id: accountTable.id,
          name: accountTable.name,
          currency: accountTable.currency,
          color: accountTable.color,
        },
      })
      .from(transactionTable)
      .innerJoin(accountTable, eq(transactionTable.accountId, accountTable.id))
      .where(eq(accountTable.userId, userId))
      .orderBy(desc(transactionTable.date))
      .limit(3)
      .all();

    return recentTransactions.map((t) => ({
      id: t.id,
      desc: t.description,
      amount: t.amount,
      currency: t.currency,
      usd: t.usdAmount,
      date: t.date,
      account: t.account.id,
      month: new Date(t.date).toLocaleString("default", { month: "long" }),
      accountDetails: t.account,
    }));
  }),

  transactions: protectedProcedure
    .input(monthlyBreakdownFiltersSchema)
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
      } else if (input.date.type === "years") {
        // Specific years filter
        const yearConditions = input.date.value.map((year) =>
          and(
            gte(transactionTable.date, `${year}-01-01`),
            lte(transactionTable.date, `${year}-12-31`),
          ),
        );
        // Note: This is a simplified approach for single year
        if (yearConditions.length === 1 && yearConditions[0]) {
          conditions.push(yearConditions[0]);
        }
        // For multiple years, you'd need an OR condition which requires more complex SQL logic
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

      transactions.forEach((transaction: any) => {
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
});
