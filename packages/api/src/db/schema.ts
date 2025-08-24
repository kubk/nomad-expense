import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const id = text("id")
  .primaryKey()
  .notNull()
  .default(sql`(lower(hex(randomblob(16))))`);

export const userTable = sqliteTable("user", {
  id: id,
});

export const accountTable = sqliteTable(
  "account",
  {
    id: id,
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    currency: text("currency").notNull(),
    color: text("color").notNull(),
  },
  (table) => [index("idx_account_user_id").on(table.userId)],
);

export const transactionTable = sqliteTable(
  "transaction",
  {
    id: id,
    accountId: text("account_id")
      .notNull()
      .references(() => accountTable.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull(),
    usdAmount: integer("usd_amount").notNull(),
    date: text("date").notNull(), // ISO timestamp string (YYYY-MM-DDTHH:mm:ss.sssZ)
  },
  (table) => [
    index("idx_transaction_account_id").on(table.accountId),
    index("idx_transaction_account_date").on(table.accountId, table.date),
  ],
);
