import { initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { getUserById } from "../db/user/get-user-by-id";
import { getEnv } from "../services/env";
import { validateTelegramLoginWidgetData } from "../services/validate-telegram-login-widget";
import { upsertUserByTelegramData } from "../db/user/upsert-user-by-telegram-data";

export async function createContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) {
  let user = null;
  // if (getEnv().STAGE === "local") {
  //   await new Promise((resolve) => setTimeout(resolve, 500));
  // }

  const authQuery = req.headers.get("Authorization");
  if (authQuery) {
    const result = validateTelegramLoginWidgetData(authQuery);
    if (result) {
      user = await upsertUserByTelegramData(result);
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
