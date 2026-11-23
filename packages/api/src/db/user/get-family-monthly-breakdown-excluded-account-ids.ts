import { eq } from "drizzle-orm";
import { userTable } from "../../db/schema";
import type { DB } from "../../services/db";

export async function getFamilyMonthlyBreakdownExcludedAccountIds(
  db: DB,
  familyId: string,
): Promise<string[]> {
  const result = await db
    .select({
      excludedAccountIds: userTable.monthlyBreakdownExcludedAccountIds,
    })
    .from(userTable)
    .where(eq(userTable.familyId, familyId))
    .limit(1);

  return result[0]?.excludedAccountIds ?? [];
}
