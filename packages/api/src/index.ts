import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "./api/trpc";
import { addCorsHeaders } from "./lib/cloudflare/cors";
import { setEnv } from "./services/env";
import { router } from "./api/router";
import { setKv } from "./services/kv";
import { uploadStatementHandler } from "./api/upload-statement-handler";
import { getDb } from "./services/db";
import { syncBankConnections } from "./services/bank-sync/sync-bank-connections";
import { reportError } from "./lib/report-error";

export default {
  async fetch(request, env) {
    setEnv(env);
    setKv(env.KV);

    if (request.method === "OPTIONS") {
      return addCorsHeaders();
    }

    const url = new URL(request.url);
    const key = url.pathname.slice(1);
    if (request.method === "POST" && key === "upload-statement") {
      return uploadStatementHandler(request);
    }

    const response = await fetchRequestHandler({
      endpoint: "/",
      req: request,
      router,
      createContext,
    });

    return addCorsHeaders(response);
  },

  async scheduled(controller, env, ctx) {
    setEnv(env);
    setKv(env.KV);

    ctx.waitUntil(
      syncBankConnections(getDb(), new Date(controller.scheduledTime)).catch(
        (error) => reportError("Scheduled bank sync crashed", error),
      ),
    );
  },
} satisfies ExportedHandler<Env>;
