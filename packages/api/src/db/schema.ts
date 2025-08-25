import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

const sharedColumns = {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString())
    .$onUpdateFn(() => new Date().toISOString()),
};

export const userTable = sqliteTable("user", {
  ...sharedColumns,
});

export const accountTable = sqliteTable(
  "account",
  {
    ...sharedColumns,
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
    ...sharedColumns,
    accountId: text("account_id")
      .notNull()
      .references(() => accountTable.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull(),
    usdAmount: integer("usd_amount").notNull(),
    type: text("type", { enum: ["expense", "income"] })
      .notNull()
      .default("expense"),
  },
  (table) => [
    index("idx_transaction_account_id").on(table.accountId),
    index("idx_transaction_type").on(table.type),
  ],
);
