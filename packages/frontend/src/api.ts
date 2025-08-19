import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { env } from "./env";
import type { ApiRouter } from "api";

export const api = createTRPCReact<ApiRouter>();

export const trpcClient = api.createClient({
  links: [
    httpBatchLink({
      url: env.VITE_API_URL,
    }),
  ],
});
