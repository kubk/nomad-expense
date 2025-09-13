import { eq, sql, and, asc, max } from "drizzle-orm";
import { protectedProcedure, t } from "./trpc";
import { accountTable, transactionTable } from "../db/schema";
import { getDb } from "../services/db";
import { z } from "zod";
import { accountColorSchema, currencySchema } from "../db/enums";
import { isNonEmpty } from "../db/batch";

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
        sort: accountTable.sort,
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
        accountTable.sort,
      )
      .orderBy(asc(accountTable.sort), asc(accountTable.createdAt))
      .all();

    return accounts;
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

      const maxSortResult = await db
        .select({ maxSort: max(accountTable.sort) })
        .from(accountTable)
        .where(eq(accountTable.familyId, familyId))
        .get();

      const nextSort = (maxSortResult?.maxSort ?? -1) + 1;

      const result = await db
        .insert(accountTable)
        .values({
          familyId,
          name: input.name,
          color: input.color,
          currency: input.currency,
          sort: nextSort,
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

  reorder: protectedProcedure
    .input(
      z.object({
        accountIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const familyId = ctx.user.familyId;

      const updateStatements = input.accountIds.map((accountId, index) =>
        db
          .update(accountTable)
          .set({ sort: index })
          .where(
            and(
              eq(accountTable.familyId, familyId),
              eq(accountTable.id, accountId),
            ),
          )
          .returning({ id: accountTable.id }),
      );

      if (isNonEmpty(updateStatements)) {
        const results = await db.batch(updateStatements);
        return results;
      }

      return [];
    }),
});
