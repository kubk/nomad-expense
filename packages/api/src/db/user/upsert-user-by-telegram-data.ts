import { sql } from "drizzle-orm";
import { getDb } from "../../services/db";
import { userTable } from "../../db/schema";
import { type UserTelegramType } from "../../services/auth/schema";

function mergeName(firstName: string, lastName?: string) {
  return firstName + (lastName ? ` ${lastName}` : "");
}

export async function upsertUserByTelegramData(
  telegramData: UserTelegramType,
  browserToken?: string,
) {
  const db = getDb();
  const newFamilyId = crypto.randomUUID();

  const result = await db
    .insert(userTable)
    .values({
      telegramId: String(telegramData.id),
      name: mergeName(telegramData.firstName, telegramData.lastName),
      username: telegramData.username,
      avatarUrl: telegramData.photoUrl,
      browserToken,
      familyId: newFamilyId,
      initialFamilyId: newFamilyId,
    })
    .onConflictDoUpdate({
      target: userTable.telegramId,
      set: {
        name: mergeName(telegramData.firstName, telegramData.lastName),
        username: telegramData.username,
        avatarUrl: telegramData.photoUrl,
        browserToken: browserToken
          ? sql`coalesce(nullif(${userTable.browserToken}, ''), excluded.browser_token)`
          : undefined,
      },
    })
    .returning();

  return result[0];
}
