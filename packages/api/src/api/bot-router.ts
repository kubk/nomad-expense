import { webhookCallback } from "grammy";
import { publicProcedure, t } from "./trpc";
import { getEnv } from "../services/env";
import { TRPCError } from "@trpc/server";
import { ignoreOldMessageMiddleware } from "../bot/ignore-old-message-middleware";
import { onCallbackQuery } from "../bot/on-callback-query";
import { onCancel } from "../bot/on-cancel";
import { onStart } from "../bot/on-start";
import { onMessage } from "../bot/on-message";
import { getBot } from "../services/telegram/get-bot";

export const botRouter = t.router({
  webhook: publicProcedure.mutation(async ({ ctx }) => {
    const request = ctx.req;

    const url = new URL(request.url);
    if (url.searchParams.get("token") !== getEnv().TELEGRAM_BOT_TOKEN) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const bot = getBot();
    bot.use(ignoreOldMessageMiddleware);
    bot.command("start", onStart);
    bot.command("cancel", onCancel);

    bot.on("message", onMessage);
    bot.on("callback_query:data", onCallbackQuery);

    const handleWebhook = webhookCallback(bot, "cloudflare-mod", {
      timeoutMilliseconds: 60_000,
    });

    try {
      return await handleWebhook(ctx.req);
    } catch (error) {
      console.error("Handled webhook error:", error);
      // Always return success to prevent Telegram from retrying
      return new Response(null, { status: 200 });
    }
  }),
});
