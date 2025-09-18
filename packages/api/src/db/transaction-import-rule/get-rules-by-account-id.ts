import { eq } from "drizzle-orm";
import type { DB } from "../../services/db";
import { transactionImportRuleTable } from "../schema";

export async function getRulesByAccountId(db: DB, accountId: string) {
  return db
    .select()
    .from(transactionImportRuleTable)
    .where(eq(transactionImportRuleTable.accountId, accountId));
}