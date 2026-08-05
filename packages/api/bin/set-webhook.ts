import { getEnv, setEnv } from "../src/services/env";
import { getBot } from "../src/services/telegram/get-bot";

/**
 * pnpm exec dotenvx run -f .dev.vars -- tsx bin/set-webhook.ts https://causal-magpie-closing.ngrok-free.app/bot.webhook
 * pnpm exec dotenvx run -f .dev.vars -- tsx bin/set-webhook.ts https://the-website.com/bot.webhook
 */
async function setWebhook(url: string) {
  if (!url) {
    console.error("Usage: pnpm exec tsx bin/set-webhook.ts <WEBHOOK_URL>");
    process.exit(1);
  }
  try {
    setEnv(process.env);
    const bot = getBot();
    const fullUrl = new URL(url);
    fullUrl.searchParams.set("token", getEnv().TELEGRAM_BOT_TOKEN);
    await bot.api.setWebhook(fullUrl.toString());
    console.log(`✓ Webhook set to ${fullUrl.toString()}`);
  } catch (error) {
    console.error("Failed to set webhook:", error);
  }
}

setWebhook(process.argv[2]);
