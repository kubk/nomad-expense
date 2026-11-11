import { env } from "./env";
import type { ApiRouter } from "api";
import { createTRPCClient, httpLink } from "@trpc/client";
import { getAuthToken } from "./auth-token";
import { createApiProxy } from "./create-api-proxy";

export const api = createTRPCClient<ApiRouter>({
  links: [
    httpLink({
      url: env.VITE_API_URL,
      headers: () => ({
        Authorization: getAuthToken(),
      }),
    }),
  ],
});

// Turns `apiProxy.accounts.list.query()` into a mobx-query-lite config keyed by the procedure path and input
export const apiProxy = createApiProxy(api);
