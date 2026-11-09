import { beforeEach, describe, expect, it, vi } from "vitest";
import { setEnv } from "../services/env";
import { reportError } from "./report-error";

const fetchMock = vi.fn(async () => new Response("{}"));

async function getReportedText(error: unknown) {
  await reportError("Bank sync failed", error, { connection: "Wise USD" });
  const [, init] = fetchMock.mock.lastCall as unknown as [string, RequestInit];
  return JSON.parse(String(init.body)).text as string;
}

describe("reportError", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    setEnv({
      CLOUDFLARE_ACCOUNT_ID: "account",
      CLOUDFLARE_API_TOKEN: "token",
      DB_URL: "postgres://localhost",
      STAGE: "production",
      FRONTEND_URL: "https://example.com",
      TELEGRAM_BOT_TOKEN: "bot",
      TELEGRAM_OIDC_CLIENT_ID: "1",
      AI_GATEWAY_API_KEY: "key",
      ERROR_REPORT_TELEGRAM_BOT_TOKEN: "reporter",
      ERROR_REPORT_TELEGRAM_CHAT_ID: "-100",
    });
  });

  it("shows the driver error that drizzle wraps in cause", async () => {
    const timeout = Object.assign(
      new Error("write CONNECT_TIMEOUT db.example.com:6543"),
      { code: "CONNECT_TIMEOUT", port: 6543 },
    );
    const drizzleError = Object.assign(
      new Error("Failed query: SELECT * FROM transaction\nparams: "),
      { query: "SELECT * FROM transaction", params: [], cause: timeout },
    );

    const text = await getReportedText(drizzleError);

    expect(text).toContain("connection: Wise USD");
    expect(text).toContain("Error: write CONNECT_TIMEOUT db.example.com:6543");
    expect(text).toContain('"code": "CONNECT_TIMEOUT"');
    expect(text).toContain("Failed query: SELECT * FROM transaction");
    expect(text.indexOf("CONNECT_TIMEOUT")).toBeLessThan(
      text.indexOf("Failed query"),
    );
  });

  it("includes Postgres error fields", async () => {
    const postgresError = Object.assign(
      new Error('duplicate key value violates unique constraint "idx"'),
      { name: "PostgresError", detail: "Key (id)=(1) already exists." },
    );

    const text = await getReportedText(postgresError);

    expect(text).toContain("PostgresError: duplicate key value");
    expect(text).toContain("Key (id)=(1) already exists.");
  });

  it("escapes HTML", async () => {
    const text = await getReportedText(new Error("<script> & co"));
    expect(text).toContain("&lt;script&gt; &amp; co");
  });
});
