import { Context } from "grammy";
import { getDb } from "../services/db";
import { setUserBotState } from "../db/user/user-bot-state";
import { sendIsTyping } from "./send-is-typing";

export async function onCancel(ctx: Context) {
  const chatId = ctx.chat?.id;
  const fromId = ctx.from?.id;

  if (!fromId || !chatId) return;

  sendIsTyping(ctx);
  await setUserBotState(getDb(), fromId.toString(), null);
  await ctx.reply("❌ Operation cancelled", {
    reply_markup: { remove_keyboard: true },
  });
}
