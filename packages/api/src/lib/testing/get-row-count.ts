import { count } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import { getDb } from "../../services/db";

export async function getRowCount(table: PgTable) {
  const result = await getDb().select({ value: count() }).from(table);
  return result[0]?.value ?? 0;
}
