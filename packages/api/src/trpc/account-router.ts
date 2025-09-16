import { eq, and, asc, max, count } from "drizzle-orm";
import { protectedProcedure, t } from "./trpc";
import { accountTable, transactionTable } from "../db/schema";
import { getDb } from "../services/db";
import { z } from "zod";
import { accountColorSchema, currencySchema } from "../db/enums";

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
        bankType: accountTable.bankType,
        lastTransactionDate: max(transactionTable.createdAt),
        transactionCount: count(transactionTable.id),
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
        accountTable.bankType,
        accountTable.createdAt,
      )
      .orderBy(asc(accountTable.sort), asc(accountTable.createdAt));

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
      const familyId = ctx.familyId;

      const maxSortResults = await db
        .select({ maxSort: max(accountTable.sort) })
        .from(accountTable)
        .where(eq(accountTable.familyId, familyId))
        .limit(1);

      const maxSortResult = maxSortResults[0];

      const nextSort = (maxSortResult?.maxSort ?? -1) + 1;

      const results = await db
        .insert(accountTable)
        .values({
          familyId,
          name: input.name,
          color: input.color,
          currency: input.currency,
          sort: nextSort,
        })
        .returning({ id: accountTable.id });

      const result = results[0];

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

      const results = await db
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
        .returning({ id: accountTable.id });

      const result = results[0];

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

      const results = await db
        .delete(accountTable)
        .where(
          and(
            eq(accountTable.familyId, familyId),
            eq(accountTable.id, input.id),
          ),
        )
        .returning({ id: accountTable.id });

      const result = results[0];

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

      if (updateStatements.length > 0) {
        const results = await db.transaction(async (tx) => {
          const txResults = [];
          for (const [accountId, index] of input.accountIds.map(
            (id, idx) => [id, idx] as const,
          )) {
            const result = await tx
              .update(accountTable)
              .set({ sort: index })
              .where(
                and(
                  eq(accountTable.familyId, familyId),
                  eq(accountTable.id, accountId),
                ),
              )
              .returning({ id: accountTable.id });
            txResults.push(result);
          }
          return txResults;
        });
        return results;
      }

      return [];
    }),
});
