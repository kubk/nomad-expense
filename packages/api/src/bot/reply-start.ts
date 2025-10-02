import { Context } from "grammy";
import { InlineKeyboard } from "grammy";
import { getEnv } from "../services/env";
import { links } from "../bot/messages";

export async function replyStart(ctx: Context) {
  let inlineKeyboard = new InlineKeyboard();

  // Locally it's localhost and Telegram doesn't support such links
  if (getEnv().STAGE !== "local") {
    inlineKeyboard = inlineKeyboard.webApp(
      "📱 Open App",
      getEnv().FRONTEND_URL,
    );
  }
  inlineKeyboard.url("Telegram group", links.channel);

  await ctx.reply(
    "Track your expenses across different accounts and families",
    {
      reply_markup: inlineKeyboard,
    },
  );
}
