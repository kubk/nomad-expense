import { env } from "./env";
import type { ApiRouter } from "api";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { getAuthToken } from "./auth-token";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
});

const trpcClient = createTRPCClient<ApiRouter>({
  links: [
    httpBatchLink({
      url: env.VITE_API_URL,
      headers: () => ({
        Authorization: getAuthToken(),
      }),
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<ApiRouter>({
  client: trpcClient,
  queryClient,
});
