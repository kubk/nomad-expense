import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const id = text("id")
  .primaryKey()
  .notNull()
  .default(sql`(lower(hex(randomblob(16))))`);

export const userTable = sqliteTable("user", {
  id: id,
  baseCurrency: text("base_currency").notNull(),
});

export const accountTable = sqliteTable("account", {
  id: id,
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  currency: text("currency").notNull(),
  color: text("color").notNull(),
});

export const transactionTable = sqliteTable("transaction", {
  id: id,
  accountId: text("account_id")
    .notNull()
    .references(() => accountTable.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  usdAmount: integer("usd_amount").notNull(),
  date: text("date").notNull(),
});
