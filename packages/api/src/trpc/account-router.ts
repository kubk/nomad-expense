import { eq, sql, and } from "drizzle-orm";
import { protectedProcedure, t } from "./trpc";
import {
  accountColorSchema,
  accountTable,
  currencySchema,
  transactionTable,
} from "../db/schema";
import { getDb } from "../services/db";
import { z } from "zod";

export const accountRouter = t.router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const familyId = ctx.user.familyId;

    const accounts = await db
      .select({
        id: accountTable.id,
        name: accountTable.name,
        currency: accountTable.currency,
        color: accountTable.color,
      })
      .from(accountTable)
      .where(eq(accountTable.familyId, familyId))
      .all();

    return accounts;
  }),

  listWithStats: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const familyId = ctx.user.familyId;

    const accountsWithStats = await db
      .select({
        id: accountTable.id,
        name: accountTable.name,
        currency: accountTable.currency,
        color: accountTable.color,
        transactionCount: sql<number>`COALESCE(COUNT(${transactionTable.id}), 0)`,
        lastTransactionDate: sql<
          string | null
        >`MAX(${transactionTable.createdAt})`,
      })
      .from(accountTable)
      .leftJoin(
        transactionTable,
        eq(accountTable.id, transactionTable.accountId),
      )
      .where(eq(accountTable.familyId, familyId))
      .groupBy(
        accountTable.id,
        accountTable.name,
        accountTable.currency,
        accountTable.color,
      )
      .all();

    return accountsWithStats;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        color: accountColorSchema,
        currency: currencySchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const familyId = ctx.user.familyId;

      const result = await db
        .insert(accountTable)
        .values({
          familyId,
          name: input.name,
          color: input.color,
          currency: input.currency,
        })
        .returning({ id: accountTable.id })
        .get();

      return result;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        color: accountColorSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const familyId = ctx.user.familyId;

      const result = await db
        .update(accountTable)
        .set({
          name: input.name,
          color: input.color,
        })
        .where(
          and(
            eq(accountTable.familyId, familyId),
            eq(accountTable.id, input.id),
          ),
        )
        .returning({ id: accountTable.id })
        .get();

      return result;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const familyId = ctx.user.familyId;

      const result = await db
        .delete(accountTable)
        .where(
          and(
            eq(accountTable.familyId, familyId),
            eq(accountTable.id, input.id),
          ),
        )
        .returning({ id: accountTable.id })
        .get();

      return result;
    }),
});
