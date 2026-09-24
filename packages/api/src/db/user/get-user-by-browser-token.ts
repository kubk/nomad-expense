import { eq } from "drizzle-orm";
import { userTable } from "../../db/schema";
import { getDb } from "../../services/db";

export async function getUserByBrowserToken(browserToken: string) {
  const users = await getDb()
    .select()
    .from(userTable)
    .where(eq(userTable.browserToken, browserToken))
    .limit(1);

  return users[0] || null;
}
