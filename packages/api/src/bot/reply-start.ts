import { Context } from "grammy";
import { InlineKeyboard } from "grammy";
import { getEnv } from "../services/env";
import { links } from "../bot/messages";
import { getTranslation } from "../translations/translations";

export async function replyStart(ctx: Context) {
  const { t } = getTranslation(ctx.from);
  let inlineKeyboard = new InlineKeyboard();

  // Locally it's localhost and Telegram doesn't support such links
  if (getEnv().STAGE !== "local") {
    inlineKeyboard = inlineKeyboard.webApp(t("openApp"), getEnv().FRONTEND_URL);
  }
  inlineKeyboard.url(t("telegramGroup"), links.channel);

  await ctx.replyWithPhoto(
    "https://expense-tracker-frontend.7gorbachevm.workers.dev/img/preview.png",
    {
      caption: t("startCaption"),
      reply_markup: inlineKeyboard,
    },
  );
}
