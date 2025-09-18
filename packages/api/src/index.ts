import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "./api/trpc";
import { addCorsHeaders } from "./lib/cloudflare/cors";
import { setEnv } from "./services/env";
import { router } from "./api/router";
import { setKv } from "./services/kv";
import { uploadStatementHandler } from "./api/upload-statement-handler";

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
      onError: ({ error }) => {
        if (error.code === "INTERNAL_SERVER_ERROR") {
          console.error(error);
        }
      },
    });

    return addCorsHeaders(response);
  },
} satisfies ExportedHandler<Env>;
