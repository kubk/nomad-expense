import { eq, sql } from "drizzle-orm";
import { protectedProcedure, t } from "./trpc";
import { accountTable, transactionTable } from "../db/schema";
import { getDb } from "../services/db";

export const accountRouter = t.router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const accounts = await db
      .select({
        id: accountTable.id,
        name: accountTable.name,
        currency: accountTable.currency,
        color: accountTable.color,
      })
      .from(accountTable)
      .where(eq(accountTable.userId, userId))
      .all();

    return accounts;
  }),

  listWithStats: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const accountsWithStats = await db
      .select({
        id: accountTable.id,
        name: accountTable.name,
        currency: accountTable.currency,
        color: accountTable.color,
        transactionCount: sql<number>`COALESCE(COUNT(${transactionTable.id}), 0)`,
        lastTransactionDate: sql<string | null>`MAX(${transactionTable.date})`,
      })
      .from(accountTable)
      .leftJoin(transactionTable, eq(accountTable.id, transactionTable.accountId))
      .where(eq(accountTable.userId, userId))
      .groupBy(accountTable.id, accountTable.name, accountTable.currency, accountTable.color)
      .all();

    return accountsWithStats;
  }),
});
