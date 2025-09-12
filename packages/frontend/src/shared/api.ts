import { env } from "./env";
import type { ApiRouter } from "api";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

export const authQueryKey = "authQuery";

const trpcClient = createTRPCClient<ApiRouter>({
  links: [
    httpBatchLink({
      url: env.VITE_API_URL,
      headers: {
        "x-user-id":
          env.VITE_USER_ID && env.VITE_STAGE === "local"
            ? env.VITE_USER_ID
            : undefined,
        Authorization: localStorage.getItem(authQueryKey)
          ? localStorage.getItem(authQueryKey) || ""
          : undefined,
      },
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<ApiRouter>({
  client: trpcClient,
  queryClient,
});
