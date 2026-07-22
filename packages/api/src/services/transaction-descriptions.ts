import { count, eq, and, desc } from "drizzle-orm";
import type { DB } from "./db";
import { accountTable, transactionTable } from "../db/schema";
import type { TransactionType } from "../db/enums";
import type { SupportedCurrency } from "./money/currency";

export async function getMostUsedDescriptions(
  db: DB,
  familyId: string,
  currency: SupportedCurrency,
  transactionType: TransactionType,
): Promise<string[]> {
  const descriptions = await db
    .select({
      description: transactionTable.description,
      count: count(),
    })
    .from(transactionTable)
    .innerJoin(accountTable, eq(transactionTable.accountId, accountTable.id))
    .where(
      and(
        eq(accountTable.familyId, familyId),
        eq(accountTable.currency, currency),
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
