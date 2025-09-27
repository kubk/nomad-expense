import { DB } from "../../services/db";
import { AccountSelect } from "../db-types";
import { accountTable } from "../schema";
import { and, eq } from "drizzle-orm";

export type AccountFromFamily = Pick<
  AccountSelect,
  "id" | "currency" | "bankType" | "meta" | "timezone"
>;

type Result =
  | { type: "success"; account: AccountFromFamily }
  | { type: "notFound" };

export async function getAccountByFamilyId(
  db: DB,
  accountId: string,
  familyId: string,
): Promise<Result> {
  const account = await db
    .select({
      id: accountTable.id,
      currency: accountTable.currency,
      bankType: accountTable.bankType,
      meta: accountTable.meta,
      timezone: accountTable.timezone,
    })
    .from(accountTable)
    .where(
      and(eq(accountTable.id, accountId), eq(accountTable.familyId, familyId)),
    );

  if (account.length && account[0]) {
    return { type: "success", account: account[0] };
  }

  return { type: "notFound" };
}
