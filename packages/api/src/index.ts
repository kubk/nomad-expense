import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "./trpc/trpc";
import { addCorsHeaders } from "./lib/cloudflare/cors";
import { setEnv } from "./services/env";
import { router } from "./trpc/router";
import { setKv } from "./services/kv";

export default {
  async fetch(request, env) {
    setEnv(env);
    setKv(env.KV);

    if (request.method === "OPTIONS") {
      return addCorsHeaders();
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
