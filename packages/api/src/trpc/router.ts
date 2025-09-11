import { getEnv } from "../services/env";
import { publicProcedure } from "./trpc";
import { t } from "./trpc";
import { userRouter } from "./user-router";
import { expenseRouter } from "./expense-router";
import { accountRouter } from "./account-router";
import { familyRouter } from "./family-router";
import { getDb } from "../services/db";
import { seedDatabase } from "../db/seed";
import { migrateFromCsv } from "../db/migrate-from-csv";

export const router = t.router({
  status: publicProcedure.query(() => {
    return {
      status: "ok",
      stage: getEnv().STAGE,
    };
  }),
  seed: publicProcedure.query(async () => {
    if (getEnv().STAGE === "local") {
      const db = getDb();
      await seedDatabase(db);
    }
    return { success: true };
  }),
  migrateFromCsv: publicProcedure.query(async () => {
    if (getEnv().STAGE === "local") {
      const db = getDb();
      await migrateFromCsv(db);
      return { success: true };
    }
    return {
      success: false,
      error: "Migration only available in local environment",
    };
  }),
  users: userRouter,
  expenses: expenseRouter,
  accounts: accountRouter,
  family: familyRouter,
});

export type AppRouter = typeof router;
