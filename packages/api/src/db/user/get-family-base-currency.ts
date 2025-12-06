import { getDb } from "../../services/db";
import { userTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import type { SupportedCurrency } from "../../services/money/currency";

export async function getFamilyBaseCurrency(
  familyId: string,
): Promise<SupportedCurrency> {
  const db = getDb();

  const result = await db
    .select({ baseCurrency: userTable.baseCurrency })
    .from(userTable)
    .where(eq(userTable.familyId, familyId))
    .limit(1);

  // Default to USD if no user found (shouldn't happen in practice)
  return result[0]?.baseCurrency ?? "USD";
}
