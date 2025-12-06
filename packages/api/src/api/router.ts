import { getEnv } from "../services/env";
import { publicProcedure } from "./trpc";
import { t } from "./trpc";
import { userRouter } from "./user-router";
import { expenseRouter } from "./transaction-router";
import { accountRouter } from "./account-router";
import { familyRouter } from "./family-router";
import { botRouter } from "./bot-router";

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
  bot: botRouter,
  family: familyRouter,
});

export type AppRouter = typeof router;
