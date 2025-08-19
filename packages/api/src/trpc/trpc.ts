import { initTRPC } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export function createContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) {
  return {
    req,
    resHeaders,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create();

export const publicProcedure = t.procedure;
