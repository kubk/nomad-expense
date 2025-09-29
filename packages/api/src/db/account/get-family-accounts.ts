import { eq } from "drizzle-orm";
import { DB } from "../../services/db";
import { accountTable } from "../schema";

export async function getFamilyAccounts(db: DB, familyId: string) {
  return db
    .select()
    .from(accountTable)
    .where(eq(accountTable.familyId, familyId));
}
