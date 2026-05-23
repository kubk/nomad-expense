import { Context } from "grammy";
import { getDb } from "../services/db";
import { setUserBotState } from "../db/user/user-bot-state";
import { sendIsTyping } from "./send-is-typing";
import { getTranslation } from "../translations/translations";

export async function onCancel(ctx: Context) {
  const chatId = ctx.chat?.id;
  const fromId = ctx.from?.id;

  if (!fromId || !chatId) return;

  sendIsTyping(ctx);
  await setUserBotState(getDb(), fromId.toString(), null);
  const { t } = getTranslation(ctx.from);

  await ctx.reply(t("operationCancelled"), {
    reply_markup: { remove_keyboard: true },
  });
}
