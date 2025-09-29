import { count, eq, and, desc } from "drizzle-orm";
import type { DB } from "./db";
import { transactionTable } from "../db/schema";
import type { TransactionType } from "../db/enums";

export async function getMostUsedDescriptions(
  db: DB,
  accountId: string,
  transactionType: TransactionType,
): Promise<string[]> {
  const descriptions = await db
    .select({
      description: transactionTable.description,
      count: count(),
    })
    .from(transactionTable)
    .where(
      and(
        eq(transactionTable.accountId, accountId),
        eq(transactionTable.source, "manual"),
        eq(transactionTable.type, transactionType),
      ),
    )
    .groupBy(transactionTable.description)
    .orderBy(desc(count()))
    .limit(25);

  if (descriptions.length === 0) {
    // Return default suggestions based on transaction type
    if (transactionType === "expense") {
      return [
        "Groceries",
        "Restaurant",
        "Transport",
        "Shopping",
        "Utilities",
        "Entertainment",
        "Health",
        "Education",
        "Travel",
      ];
    } else {
      return [
        "Salary",
        "Gift",
        "Investment",
        "Loan",
        "Interest",
        "Bonus",
        "Refund",
      ];
    }
  }

  return descriptions.map((item) => item.description);
}
