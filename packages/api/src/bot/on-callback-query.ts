import { Context } from "grammy";

export function onCallbackQuery(ctx: Context) {
  if (!ctx.callbackQuery) return;
  const callbackData = ctx.callbackQuery.data;
  console.log("callback", callbackData);
}
