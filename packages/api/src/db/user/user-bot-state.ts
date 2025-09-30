import { z } from "zod";
import { userTable } from "../schema";
import { eq } from "drizzle-orm";
import { DB } from "../../services/db";
import { transactionTypeSchema } from "../enums";

export const userBotStateSchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("uploadStatement"),
      fileId: z.string(),
    }),
    z.object({
      type: z.literal("selectingTransactionType"),
      accountId: z.string(),
      amountCents: z.number(),
      description: z.string().optional(),
    }),
    z.object({
      type: z.literal("addingTransactionDescription"),
      accountId: z.string(),
      amountCents: z.number(),
      transactionType: transactionTypeSchema,
    }),
  ])
  .nullable();

type UserBotState = z.infer<typeof userBotStateSchema>;

export function createUserBotState(state: UserBotState): UserBotState {
  return state;
}

export function setUserBotState(
  db: DB,
  telegramId: string,
  state: UserBotState,
) {
  return db
    .update(userTable)
    .set({
      botState: userBotStateSchema.parse(state),
    })
    .where(eq(userTable.telegramId, telegramId));
}

export function getUserBotState(
  db: DB,
  telegramId: string,
): Promise<UserBotState | null> {
  return db
    .select()
    .from(userTable)
    .where(eq(userTable.telegramId, telegramId))
    .then((rows) =>
      rows[0] && rows[0].botState
        ? userBotStateSchema.parse(rows[0].botState)
        : null,
    );
}
