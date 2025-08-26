import { getEnv } from "../services/env";
import { publicProcedure } from "./trpc";
import { t } from "./trpc";
import { userRouter } from "./user-router";
import { expenseRouter } from "./expense-router";
import { accountRouter } from "./account-router";
import { familyRouter } from "./family-router";
import { getDb } from "../services/db";
import { seedDatabase } from "../db/seed";

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
  users: userRouter,
  expenses: expenseRouter,
  accounts: accountRouter,
  family: familyRouter,
});

export type AppRouter = typeof router;
