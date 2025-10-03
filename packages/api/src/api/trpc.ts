import { initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { authenticate } from "../services/auth/authenticate";
import { getEnv } from "../services/env";

export async function createContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) {
  if (getEnv().STAGE === "local") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const authResult = await authenticate({ type: "api", req });

  return {
    req,
    resHeaders,
    userId: authResult?.userId || null,
    familyId: authResult?.familyId || null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create({
  errorFormatter: ({ shape, error }) => {
    if (
      error.code === "INTERNAL_SERVER_ERROR" &&
      getEnv().STAGE === "production"
    ) {
      return {
        ...shape,
        message: "Internal server error",
      };
    }
    return shape;
  },
});

const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId || !ctx.familyId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      familyId: ctx.familyId,
    },
  });
});

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
