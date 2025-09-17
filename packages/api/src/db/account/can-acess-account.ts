import { DB } from "../../services/db";
import { accountTable } from "../schema";
import { and, eq } from "drizzle-orm";

export async function getAccountByFamilyId(
  db: DB,
  accountId: string,
  familyId: string,
) {
  const account = await db
    .select({ currency: accountTable.currency })
    .from(accountTable)
    .where(
      and(eq(accountTable.id, accountId), eq(accountTable.familyId, familyId)),
    );

  if (account.length && account[0]) {
    return { type: "success", account: account[0] } as const;
  }

  return { type: "notFound" } as const;
}
