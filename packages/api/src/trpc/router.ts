import { userTable } from "../db/schema";
import { getDb } from "../services/db";
import { getEnv } from "../services/env";
import { publicProcedure } from "./trpc";
import { t } from "./trpc";

export const router = t.router({
  status: publicProcedure.query(() => {
    return {
      status: "ok",
      stage: getEnv().STAGE,
    };
  }),
  users: t.router({
    list: publicProcedure.query(async () => {
      const users = await getDb().select().from(userTable);
      return users;
    }),
  }),
});

export type AppRouter = typeof router;
