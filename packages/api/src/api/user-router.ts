import { t } from "./trpc";
import { protectedProcedure } from "./trpc";
import { getUserById } from "../db/user/get-user-by-id";

export const userRouter = t.router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserById(ctx.userId);
    if (!user) {
      throw new Error("User not found");
    }
    return {
      id: user.id,
      familyId: user.familyId,
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }),
});
