import { eq } from "drizzle-orm";
import type { DB } from "../../services/db";
import { userTable } from "../schema";

export async function getFamilyOwner(db: DB, familyId: string) {
  const users = await db
    .select()
    .from(userTable)
    .where(eq(userTable.initialFamilyId, familyId))
    .limit(1);

  return users[0] || null;
}
