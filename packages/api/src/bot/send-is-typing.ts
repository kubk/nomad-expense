import { Context } from "grammy";

export function sendIsTyping(ctx: Context) {
  if (!ctx.chat?.id) return;
  ctx.api.sendChatAction(ctx.chat.id, "typing");
}
