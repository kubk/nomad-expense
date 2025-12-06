import { eq, and, sql, asc } from "drizzle-orm";
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
    const db = getDb();
    const userId = ctx.userId;

    const result = await db
      .select({ baseCurrency: userTable.baseCurrency })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    return result[0]?.baseCurrency ?? "USD";
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

      // Update baseCurrency for all family members
      await db
        .update(userTable)
        .set({ baseCurrency: input.baseCurrency })
        .where(eq(userTable.familyId, familyId));

      return { success: true };
    }),

  recalculateTransactions: protectedProcedure.mutation(async ({ ctx }) => {
    const db = getDb();
    const familyId = ctx.familyId;

    // Get the family's base currency
    const userResult = await db
      .select({ baseCurrency: userTable.baseCurrency })
      .from(userTable)
      .where(eq(userTable.familyId, familyId))
      .limit(1);

    const baseCurrency = userResult[0]?.baseCurrency ?? "USD";

    // Get all transactions for this family
    const transactions = await db
      .select({
        id: transactionTable.id,
        amount: transactionTable.amount,
        currency: transactionTable.currency,
        createdAt: transactionTable.createdAt,
      })
      .from(transactionTable)
      .innerJoin(accountTable, eq(transactionTable.accountId, accountTable.id))
      .where(eq(accountTable.familyId, familyId));

    // Recalculate each transaction's base amount
    let updatedCount = 0;
    for (const transaction of transactions) {
      try {
        const newBaseAmount = await convertWithLiveRate(
          transaction.amount,
          transaction.currency,
          baseCurrency,
          transaction.createdAt,
        );

        await db
          .update(transactionTable)
          .set({ usdAmount: newBaseAmount })
          .where(eq(transactionTable.id, transaction.id));

        updatedCount++;
      } catch (error) {
        console.error(
          `Failed to recalculate transaction ${transaction.id}:`,
          error,
        );
        // Continue with other transactions even if one fails
      }
    }

    return {
      success: true,
      updatedCount,
      totalCount: transactions.length,
    };
  }),
});
