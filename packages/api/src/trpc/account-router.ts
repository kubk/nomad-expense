import { eq, and, asc, desc, max } from "drizzle-orm";
import { protectedProcedure, t } from "./trpc";
import { accountTable, transactionTable } from "../db/schema";
import { getDb } from "../services/db";
import { z } from "zod";
import { accountColorSchema, currencySchema } from "../db/enums";
import { isNonEmpty } from "../db/batch";

export const accountRouter = t.router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const familyId = ctx.familyId;

    const accounts = await db
      .select({
        id: accountTable.id,
        name: accountTable.name,
        currency: accountTable.currency,
        color: accountTable.color,
        sort: accountTable.sort,
      })
      .from(accountTable)
      .where(eq(accountTable.familyId, familyId))
      .orderBy(asc(accountTable.sort), asc(accountTable.createdAt))
      .all();

    const transactionQueries = accounts.map((account) =>
      db
        .select({
          createdAt: transactionTable.createdAt,
        })
        .from(transactionTable)
        .where(eq(transactionTable.accountId, account.id))
        .orderBy(desc(transactionTable.createdAt))
        .limit(1),
    );

    const lastTransactions = isNonEmpty(transactionQueries)
      ? await db.batch(transactionQueries)
      : [];

    const accountsWithLastTransaction = accounts.map((account, index) => ({
      ...account,
      lastTransactionDate: lastTransactions[index]?.[0]?.createdAt || null,
    }));

    return accountsWithLastTransaction;
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
      const familyId = ctx.familyId;

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
      const familyId = ctx.familyId;

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
      const familyId = ctx.familyId;

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
      const familyId = ctx.familyId;

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
