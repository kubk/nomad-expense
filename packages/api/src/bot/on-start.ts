import { Context } from "grammy";
import { sendIsTyping } from "./send-is-typing";
import { replyStart } from "./reply-start";

export async function onStart(ctx: Context) {
  if (!ctx.from || !ctx.chat?.id) return;

  sendIsTyping(ctx);

  await replyStart(ctx);
}
