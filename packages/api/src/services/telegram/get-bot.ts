import { Bot } from "grammy";
import { getEnv } from "../env";

export function getBot() {
  return new Bot(getEnv().TELEGRAM_BOT_TOKEN);
}
