import { DB } from "../../services/db";
import { accountTable } from "../schema";
import { eq, asc, isNotNull, and } from "drizzle-orm";

export function getFamilyImportableAccounts(db: DB, familyId: string) {
  return db
    .select()
    .from(accountTable)
    .where(
      and(
        eq(accountTable.familyId, familyId),
        isNotNull(accountTable.bankType),
      ),
    )
    .orderBy(asc(accountTable.sort));
}
