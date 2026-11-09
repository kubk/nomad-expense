import { getEnv } from "../services/env";

// Telegram allows 4096 characters, escaping adds some
const MAX_DETAILS_LENGTH = 3500;

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getCause(error: unknown): unknown {
  return error instanceof Error && "cause" in error ? error.cause : undefined;
}

// Drizzle wraps driver errors ("Failed query: …") and keeps the real reason,
// e.g. CONNECT_TIMEOUT, in `cause`. Postgres puts code/detail/hint in fields.
function describeError(error: unknown): string {
  let rootCause = error;
  for (let depth = 0; getCause(rootCause) && depth < 5; depth++) {
    rootCause = getCause(rootCause);
  }

  const fields =
    typeof rootCause === "object" && rootCause !== null
      ? Object.fromEntries(Object.entries(rootCause))
      : {};
  const lines = [
    rootCause instanceof Error
      ? `${rootCause.name}: ${rootCause.message}`
      : String(rootCause),
    Object.keys(fields).length > 0 ? JSON.stringify(fields, null, 2) : "",
    error instanceof Error ? (error.stack ?? "") : "",
  ];
  return lines.filter(Boolean).join("\n");
}

export async function reportError(
  title: string,
  error: unknown,
  context: Record<string, string> = {},
) {
  console.error(title, error, context);

  const env = getEnv();
  if (
    env.STAGE !== "production" ||
    !env.ERROR_REPORT_TELEGRAM_BOT_TOKEN ||
    !env.ERROR_REPORT_TELEGRAM_CHAT_ID
  ) {
    return;
  }

  const details = [
    ...Object.entries(context).map(([key, value]) => `${key}: ${value}`),
    describeError(error),
  ].join("\n");
  const text = `[expense-tracker] <b>${escapeHtml(title)}</b>\n<pre>${escapeHtml(details.slice(0, MAX_DETAILS_LENGTH))}</pre>`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${env.ERROR_REPORT_TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: env.ERROR_REPORT_TELEGRAM_CHAT_ID,
          text,
          parse_mode: "HTML",
        }),
      },
    );
    if (!response.ok) {
      throw new Error(`Telegram responded ${response.status}`);
    }
  } catch (telegramError) {
    console.error("Failed to report error to Telegram", telegramError);
  }
}
