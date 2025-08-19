import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const id = text("id")
  .primaryKey()
  .notNull()
  .default(sql`(lower(hex(randomblob(16))))`);

export const userTable = sqliteTable("user", {
  id: id,
});
