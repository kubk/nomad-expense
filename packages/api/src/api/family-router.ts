import { eq, and, sql, asc, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, t } from "./trpc";
import {
  userTable,
  inviteTable,
  transactionTable,
  accountTable,
} from "../db/schema";
import { getDb } from "../services/db";
import { getUserById } from "../db/user/get-user-by-id";
import { userCacheSet } from "../services/user-cache";
import { z } from "zod";
import { DateTime } from "luxon";
import { generateInviteCode } from "../services/generate-invoice-code";
import { getFamilyOwner } from "../db/user/get-family-owner";
import { notifyViaTelegram } from "../services/notifications/notify-via-telegram";
import { getUserDisplayName } from "../services/user-display";
import { currencySchema } from "../db/enums";
import { convertWithLiveRate } from "../services/money/exchange-rate-api";
import { getFamilyBaseCurrency } from "../db/user/get-family-base-currency";

export const familyRouter = t.router({
  listMembers: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const familyId = ctx.familyId;

    const members = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        username: userTable.username,
        avatarUrl: userTable.avatarUrl,
        createdAt: userTable.createdAt,
      })
      .from(userTable)
      .where(eq(userTable.familyId, familyId))
      .orderBy(asc(userTable.createdAt));

    return members;
  }),

  generateInvite: protectedProcedure.mutation(async ({ ctx }) => {
    const db = getDb();
    const familyId = ctx.familyId;
    const userId = ctx.userId;

    // Invalidate any existing active invites
    await db
      .update(inviteTable)
      .set({
        usedAt: new Date(),
        usedByUserId: userId,
      })
      .where(
        and(
          eq(inviteTable.familyId, familyId),
          sql`${inviteTable.usedAt} IS NULL`,
          sql`${inviteTable.expiresAt} > NOW()`,
        ),
      );

    // Generate new invite
    const code = generateInviteCode();
    const expiresAt = DateTime.now().plus({ days: 1 }).toJSDate();

    const result = await db
      .insert(inviteTable)
      .values({
        familyId,
        invitedByUserId: userId,
        code,
        expiresAt: expiresAt,
      })
      .returning({ id: inviteTable.id, code: inviteTable.code });

    const resultData = result[0];

    return resultData;
  }),

  getActiveInvite: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const familyId = ctx.familyId;

    const activeInvite = await db
      .select({
        id: inviteTable.id,
        code: inviteTable.code,
        expiresAt: inviteTable.expiresAt,
        invitedByUserId: inviteTable.invitedByUserId,
      })
      .from(inviteTable)
      .where(
        and(
          eq(inviteTable.familyId, familyId),
          sql`${inviteTable.usedAt} IS NULL`,
          sql`${inviteTable.expiresAt} > NOW()`,
        ),
      );

    const activeInviteResult = activeInvite[0];
    return activeInviteResult ?? null;
  }),

  joinFamily: protectedProcedure
    .input(
      z.object({
        code: z.string().min(6).max(6),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.userId;

      // Find valid invite
      const invite = await db
        .select({
          id: inviteTable.id,
          familyId: inviteTable.familyId,
          invitedByUserId: inviteTable.invitedByUserId,
          expiresAt: inviteTable.expiresAt,
          usedAt: inviteTable.usedAt,
        })
        .from(inviteTable)
        .where(eq(inviteTable.code, input.code));

      const inviteResult = invite[0];
      if (!inviteResult) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid invite code",
        });
      }

      if (inviteResult.usedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invite has already been used",
        });
      }

      if (new Date(inviteResult.expiresAt) < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invite has expired",
        });
      }

      // Get inviter info
      const inviterResult = await db
        .select({
          name: userTable.name,
          username: userTable.username,
        })
        .from(userTable)
        .where(eq(userTable.id, inviteResult.invitedByUserId))
        .limit(1);

      const inviter = inviterResult[0];

      // Update user's family and mark invite as used atomically
      await db.transaction(async (tx) => {
        await tx
          .update(userTable)
          .set({
            familyId: inviteResult.familyId,
          })
          .where(eq(userTable.id, userId));

        await tx
          .update(inviteTable)
          .set({
            usedAt: new Date(),
            usedByUserId: userId,
          })
          .where(eq(inviteTable.id, inviteResult.id));
      });

      const user = await getUserById(userId);
      // Update cache with new familyId
      if (user?.telegramId) {
        await userCacheSet(user.telegramId, {
          userId,
          familyId: inviteResult.familyId,
        });
      }

      // Notify family owner about new member
      const familyOwner = await getFamilyOwner(inviteResult.familyId);
      if (familyOwner && familyOwner.id !== userId && user) {
        await notifyViaTelegram({
          type: "userJoinedYourFamily",
          targetUserId: familyOwner.id,
          newMemberName: getUserDisplayName(user),
        });
      }

      return {
        success: true,
        inviter,
      };
    }),

  getBaseCurrency: protectedProcedure.query(async ({ ctx }) => {
    return getFamilyBaseCurrency(ctx.familyId);
  }),

  updateBaseCurrency: protectedProcedure
    .input(
      z.object({
        baseCurrency: currencySchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const familyId = ctx.familyId;
      const newBaseCurrency = input.baseCurrency;

      // Update baseCurrency for all family members
      await db
        .update(userTable)
        .set({ baseCurrency: newBaseCurrency })
        .where(eq(userTable.familyId, familyId));

      // Get all transactions for this family
      const transactions = await db
        .select({
          id: transactionTable.id,
          amount: transactionTable.amount,
          currency: transactionTable.currency,
          createdAt: transactionTable.createdAt,
        })
        .from(transactionTable)
        .innerJoin(
          accountTable,
          eq(transactionTable.accountId, accountTable.id),
        )
        .where(eq(accountTable.familyId, familyId));

      if (transactions.length === 0) {
        return {
          success: true,
          updatedCount: 0,
          totalCount: 0,
        };
      }

      // Convert transactions in batches to avoid overwhelming the API
      const CONVERSION_BATCH_SIZE = 50;
      const successfulConversions: { id: string; newBaseAmount: number }[] = [];
      let processedCount = 0;

      console.log(`Converting ${transactions.length} transactions...`);

      for (let i = 0; i < transactions.length; i += CONVERSION_BATCH_SIZE) {
        const batch = transactions.slice(i, i + CONVERSION_BATCH_SIZE);

        const batchResults = await Promise.all(
          batch.map(async (transaction) => {
            try {
              const newBaseAmount = await convertWithLiveRate(
                transaction.amount,
                transaction.currency,
                newBaseCurrency,
                transaction.createdAt,
              );
              return { id: transaction.id, newBaseAmount, success: true };
            } catch (error) {
              console.error(
                `Failed to convert transaction ${transaction.id}:`,
                {
                  id: transaction.id,
                  amount: transaction.amount,
                  fromCurrency: transaction.currency,
                  toCurrency: newBaseCurrency,
                  date: transaction.createdAt,
                },
                error,
              );
              return {
                id: transaction.id,
                newBaseAmount: null,
                success: false,
              };
            }
          }),
        );

        for (const result of batchResults) {
          if (result.success && result.newBaseAmount !== null) {
            successfulConversions.push({
              id: result.id,
              newBaseAmount: result.newBaseAmount,
            });
          }
        }

        processedCount += batch.length;
        if (
          processedCount % 100 === 0 ||
          processedCount === transactions.length
        ) {
          console.log(
            `Converted ${processedCount}/${transactions.length} transactions`,
          );
        }
      }

      // Batch update using SQL CASE statement
      if (successfulConversions.length > 0) {
        const BATCH_SIZE = 500;
        for (let i = 0; i < successfulConversions.length; i += BATCH_SIZE) {
          const batch = successfulConversions.slice(i, i + BATCH_SIZE);
          const batchIds = batch.map((r) => r.id);

          const caseStatement = sql.join(
            batch.map((r) => sql`WHEN ${r.id} THEN ${r.newBaseAmount}`),
            sql` `,
          );

          await db
            .update(transactionTable)
            .set({
              usdAmount: sql<number>`CASE ${transactionTable.id} ${caseStatement} END::integer`,
            })
            .where(inArray(transactionTable.id, batchIds));

          if (i + BATCH_SIZE < successfulConversions.length) {
            console.log(
              `Updated ${i + batch.length} of ${successfulConversions.length} transactions...`,
            );
          }
        }
      }

      return {
        success: true,
        updatedCount: successfulConversions.length,
        totalCount: transactions.length,
      };
    }),
});
