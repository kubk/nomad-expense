import { getDb } from "../../services/db";
import { userTable } from "../../db/schema";
import type { UserTelegramType } from "../../services/validate-telegram-login-widget";

function mergeName(firstName: string, lastName?: string) {
  return firstName + (lastName ? ` ${lastName}` : "");
}

export async function upsertUserByTelegramData(telegramData: UserTelegramType) {
  const db = getDb();
  const newFamilyId = crypto.randomUUID();

  const result = await db
    .insert(userTable)
    .values({
      telegramId: String(telegramData.id),
      name: mergeName(telegramData.firstName, telegramData.lastName),
      username: telegramData.username,
      avatarUrl: telegramData.photoUrl,
      familyId: newFamilyId,
      initialFamilyId: newFamilyId,
    })
    .onConflictDoUpdate({
      target: userTable.telegramId,
      set: {
        name: mergeName(telegramData.firstName, telegramData.lastName),
        username: telegramData.username,
        avatarUrl: telegramData.photoUrl,
      },
    })
    .returning();

  return result[0];
}
