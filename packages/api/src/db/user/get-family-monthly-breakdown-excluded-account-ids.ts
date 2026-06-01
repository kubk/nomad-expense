import { eq } from "drizzle-orm";
import { userTable } from "../../db/schema";
import { getDb } from "../../services/db";

export async function getFamilyMonthlyBreakdownExcludedAccountIds(
  familyId: string,
): Promise<string[]> {
  const db = getDb();

  const result = await db
    .select({
      excludedAccountIds: userTable.monthlyBreakdownExcludedAccountIds,
    })
    .from(userTable)
    .where(eq(userTable.familyId, familyId))
    .limit(1);

  return result[0]?.excludedAccountIds ?? [];
}
