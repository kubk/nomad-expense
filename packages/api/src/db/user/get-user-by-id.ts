import { getDb } from "../../services/db";
import { userTable } from "../../db/schema";
import { eq } from "drizzle-orm";

export async function getUserById(userId: string) {
  const users = await getDb()
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId));
  return users[0] || null;
}
