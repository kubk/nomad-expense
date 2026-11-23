import type { DB } from "../../services/db";
import { userTable } from "../../db/schema";
import { eq } from "drizzle-orm";

export async function getUserById(db: DB, userId: string) {
  const users = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId));
  return users[0] || null;
}
