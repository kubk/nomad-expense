import { getEnv } from "../services/env";
import { publicProcedure } from "./trpc";
import { t } from "./trpc";
import { userRouter } from "./user-router";
import { expenseRouter } from "./expense-router";
import { accountRouter } from "./account-router";

export const router = t.router({
  status: publicProcedure.query(() => {
    return {
      status: "ok",
      stage: getEnv().STAGE,
    };
  }),
  users: userRouter,
  expenses: expenseRouter,
  accounts: accountRouter,
});

export type AppRouter = typeof router;
