import { eq } from "drizzle-orm";
import { getDb } from "../../services/db";
import { userTable } from "../schema";

export async function getFamilyOwner(familyId: string) {
  const db = getDb();
  const users = await db
    .select()
    .from(userTable)
    .where(eq(userTable.initialFamilyId, familyId))
    .limit(1);

  return users[0] || null;
}
