import { sql } from "drizzle-orm";
import { getEnv } from "../services/env";
import { getDb } from "../services/db";
import { publicProcedure } from "./trpc";
import { t } from "./trpc";
import { expenseRouter } from "./transaction-router";
import { accountRouter } from "./account-router";
import { familyRouter } from "./family-router";
import { botRouter } from "./bot-router";

export const router = t.router({
  status: publicProcedure.query(async () => {
    const db = getDb();
    const result = await db.execute(sql`SELECT 1 as ok`);
    return {
      status: "ok",
      stage: getEnv().STAGE,
      db: result[0]?.ok === 1 ? "ok" : "error",
    };
  }),
  expenses: expenseRouter,
  accounts: accountRouter,
  bot: botRouter,
  family: familyRouter,
});

export type AppRouter = typeof router;
