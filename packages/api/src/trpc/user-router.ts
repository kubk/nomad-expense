import { t } from "./trpc";
import { publicProcedure } from "./trpc";
import { getDb } from "../services/db";
import { userTable } from "../db/schema";

export const userRouter = t.router({
  list: publicProcedure.query(async () => {
    const users = await getDb().select().from(userTable);
    return users;
  }),
});
