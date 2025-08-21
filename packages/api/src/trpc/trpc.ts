import { initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { getUserById } from "../db/user/get-user-by-id";
import { getEnv } from "../services/env";

export async function createContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) {
  let user = null;
  if (getEnv().STAGE === "local") {
    const userId = req.headers.get("x-user-id");
    if (userId) {
      user = await getUserById(userId);
    }
  }

  return {
    req,
    resHeaders,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create();

const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
