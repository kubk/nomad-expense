import { t } from "./trpc";
import { publicProcedure, protectedProcedure } from "./trpc";
import { getDb } from "../services/db";
import { userTable } from "../db/schema";

export const userRouter = t.router({
  list: publicProcedure.query(async () => {
    const users = await getDb().select().from(userTable);
    return users;
  }),
  me: protectedProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.user.id,
      familyId: ctx.user.familyId,
      firstName: ctx.user.firstName,
      lastName: ctx.user.lastName,
      username: ctx.user.username,
      avatarUrl: ctx.user.avatarUrl,
      createdAt: ctx.user.createdAt,
      updatedAt: ctx.user.updatedAt,
    };
  }),
});
