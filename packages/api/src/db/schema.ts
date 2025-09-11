import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { z } from "zod";

const transactionSource = ["imported", "manual"] as const;
const transactionSourceSchema = z.enum(transactionSource);

const accountColor = [
  "blue",
  "green",
  "purple",
  "red",
  "orange",
  "yellow",
  "pink",
  "teal",
  "cyan",
  "lime",
  "amber",
  "emerald",
  "rose",
  "gray",
] as const;

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
  familyId: text("family_id").notNull(),
  initialFamilyId: text("initial_family_id").notNull(),
  name: text("name"),
  username: text("username"),
  avatarUrl: text("avatar_url"),
});

export const accountTable = sqliteTable(
  "account",
  {
    ...sharedColumns,
    familyId: text("family_id").notNull(),
    name: text("name").notNull(),
    currency: text("currency").notNull(),
    color: text("color", { enum: accountColor }).notNull(),
  },
  (table) => [index("idx_account_family_id").on(table.familyId)],
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
    source: text("source", { enum: transactionSource })
      .notNull()
      .default(transactionSourceSchema.enum.manual),
    isCountable: integer("is_countable", { mode: "boolean" })
      .notNull()
      .default(true),
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

export const inviteTable = sqliteTable(
  "invite",
  {
    ...sharedColumns,
    familyId: text("family_id").notNull(),
    invitedByUserId: text("invited_by_user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    code: text("code").notNull().unique(),
    expiresAt: text("expires_at").notNull(),
    usedAt: text("used_at"),
    usedByUserId: text("used_by_user_id").references(() => userTable.id),
  },
  (table) => [
    index("idx_invite_code").on(table.code),
    index("idx_invite_family_id").on(table.familyId),
  ],
);
