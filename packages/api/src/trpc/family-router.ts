import { eq, and, sql, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, t } from "./trpc";
import { userTable, inviteTable } from "../db/schema";
import { getDb } from "../services/db";
import { z } from "zod";
import { DateTime } from "luxon";

function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const familyRouter = t.router({
  listMembers: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const familyId = ctx.user.familyId;

    const members = await db
      .select({
        id: userTable.id,
        firstName: userTable.firstName,
        lastName: userTable.lastName,
        username: userTable.username,
        avatarUrl: userTable.avatarUrl,
        createdAt: userTable.createdAt,
      })
      .from(userTable)
      .where(eq(userTable.familyId, familyId))
      .orderBy(asc(userTable.createdAt))
      .all();

    return members;
  }),

  generateInvite: protectedProcedure.mutation(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;
    const familyId = ctx.user.familyId;

    // Invalidate any existing active invites
    await db
      .update(inviteTable)
      .set({
        usedAt: new Date().toISOString(),
        usedByUserId: userId,
      })
      .where(
        and(
          eq(inviteTable.familyId, familyId),
          sql`${inviteTable.usedAt} IS NULL`,
          sql`${inviteTable.expiresAt} > datetime('now')`,
        ),
      );

    // Generate new invite
    const code = generateInviteCode();
    const expiresAt = DateTime.now().plus({ days: 1 }).toISO();

    const result = await db
      .insert(inviteTable)
      .values({
        familyId,
        invitedByUserId: userId,
        code,
        expiresAt: expiresAt!,
      })
      .returning({ id: inviteTable.id, code: inviteTable.code })
      .get();

    return result;
  }),

  getActiveInvite: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const familyId = ctx.user.familyId;

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
          sql`${inviteTable.expiresAt} > datetime('now')`,
        ),
      )
      .get();

    return activeInvite ?? null;
  }),

  joinFamily: protectedProcedure
    .input(
      z.object({
        code: z.string().min(6).max(6),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

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
        .where(eq(inviteTable.code, input.code))
        .get();

      if (!invite) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid invite code",
        });
      }

      if (invite.usedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invite has already been used",
        });
      }

      if (new Date(invite.expiresAt) < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invite has expired",
        });
      }

      // Get inviter info
      const inviter = await db
        .select({
          firstName: userTable.firstName,
          lastName: userTable.lastName,
          username: userTable.username,
        })
        .from(userTable)
        .where(eq(userTable.id, invite.invitedByUserId))
        .get();

      // Update user's family and mark invite as used atomically
      await db.batch([
        db
          .update(userTable)
          .set({
            familyId: invite.familyId,
          })
          .where(eq(userTable.id, userId)),
        db
          .update(inviteTable)
          .set({
            usedAt: new Date().toISOString(),
            usedByUserId: userId,
          })
          .where(eq(inviteTable.id, invite.id)),
      ]);

      return {
        success: true,
        inviter,
      };
    }),
});
