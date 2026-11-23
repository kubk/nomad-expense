import { eq } from "drizzle-orm";
import { userTable } from "../../db/schema";
import type { DB } from "../../services/db";

export async function getUserByBrowserToken(db: DB, browserToken: string) {
  const users = await db
    .select()
    .from(userTable)
    .where(eq(userTable.browserToken, browserToken))
    .limit(1);

  return users[0] || null;
}
