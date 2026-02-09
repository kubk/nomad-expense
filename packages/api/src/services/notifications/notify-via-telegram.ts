import { eq, and, ne, isNotNull } from "drizzle-orm";
import { getDb } from "../db";
import { userTable } from "../../db/schema";
import { getBot } from "../telegram/get-bot";
import type { Money } from "../money/money";

export type NotificationPayload =
  | {
      type: "userJoinedYourFamily";
      targetUserId: string;
      newMemberName: string;
    }
  | {
      type: "newTransaction";
      familyId: string;
      excludeUserId: string;
      transactionAuthor: string;
      description: string;
      money: Money;
    }
  | {
      type: "uploadedBankStatement";
      familyId: string;
      excludeUserId: string;
      transactionAuthor: string;
      bankAccountName: string;
      newTransactions: number;
      removedTransactions: number;
    };

export async function notifyViaTelegram(payload: NotificationPayload) {
  const db = getDb();
  const bot = getBot();

  try {
    if (payload.type === "userJoinedYourFamily") {
      // Notify single user (family owner)
      const user = await db
        .select({ telegramId: userTable.telegramId })
        .from(userTable)
        .where(eq(userTable.id, payload.targetUserId))
        .limit(1);

      const targetUser = user[0];
      if (!targetUser?.telegramId) {
        return;
      }

      const message = `🎉 ${payload.newMemberName} has joined your family!`;
      await bot.api.sendMessage(targetUser.telegramId, message);
    } else {
      // Notify all family members except the author
      const recipients = await db
        .select({
          telegramId: userTable.telegramId,
          name: userTable.name,
        })
        .from(userTable)
        .where(
          and(
            eq(userTable.familyId, payload.familyId),
            eq(userTable.isFamilyNotified, true),
            ne(userTable.id, payload.excludeUserId),
            isNotNull(userTable.telegramId),
          ),
        );

      for (const recipient of recipients) {
        if (!recipient.telegramId) continue;

        let message: string;
        if (payload.type === "newTransaction") {
          const isIncome = payload.money.amountCents > 0;
          const amount = (Math.abs(payload.money.amountCents) / 100).toFixed(2);
          const emoji = isIncome ? "💰" : "💸";
          const verb = isIncome ? "received" : "spent";
          message = `${emoji} ${amount} ${payload.money.currency} ${verb} on *${payload.description}* by ${payload.transactionAuthor}`;
        } else {
          message = `📊 *${payload.transactionAuthor}* uploaded a bank statement for *${payload.bankAccountName}*\n`;
          message += `📥 Added: ${payload.newTransactions} transaction${payload.newTransactions !== 1 ? "s" : ""}\n`;
          message += `🗑️ Removed: ${payload.removedTransactions} transaction${payload.removedTransactions !== 1 ? "s" : ""}`;
        }

        await bot.api.sendMessage(recipient.telegramId, message, {
          parse_mode: "Markdown",
        });
      }
    }
  } catch (error) {
    console.error("Failed to send telegram notification:", error);
    // Don't throw - notifications should not break the main flow
  }
}
