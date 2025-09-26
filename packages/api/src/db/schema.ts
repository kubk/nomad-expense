import {
  pgTable,
  text,
  integer,
  index,
  uuid,
  timestamp,
  varchar,
  boolean,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import {
  accountColor,
  bank,
  currency,
  transactionImportRuleType,
  transactionSource,
  transactionType,
} from "./enums";

export const transactionSourceEnum = pgEnum(
  "transaction_source",
  transactionSource,
);
export const transactionImportRuleTypeEnum = pgEnum(
  "transaction_import_rule_type",
  transactionImportRuleType,
);
export const transactionTypeEnum = pgEnum("transaction_type", transactionType);
export const accountColorEnum = pgEnum("account_color", accountColor);
export const bankEnum = pgEnum("bank", bank);
export const currencyEnum = pgEnum("currency", currency);

const sharedColumns = {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const userTable = pgTable(
  "user",
  {
    ...sharedColumns,
    familyId: uuid("family_id").notNull(),
    initialFamilyId: uuid("initial_family_id").notNull(),
    name: varchar("name"),
    username: varchar("username"),
    avatarUrl: text("avatar_url"),
    telegramId: varchar("telegram_id").unique(),
    isAdmin: boolean("is_admin").notNull().default(false),
  },
  (table) => [index("idx_user_telegram_id").on(table.telegramId)],
);

export const accountTable = pgTable(
  "account",
  {
    ...sharedColumns,
    familyId: uuid("family_id").notNull(),
    name: varchar("name").notNull(),
    currency: currencyEnum("currency").notNull(),
    color: accountColorEnum("color").notNull(),
    bankType: bankEnum("bank_type"),
    timezone: varchar("timezone").default("UTC"),
    meta: jsonb("meta"),
    sort: integer("sort").notNull().default(0),
  },
  (table) => [index("idx_account_family_id").on(table.familyId)],
);

export const transactionTable = pgTable(
  "transaction",
  {
    ...sharedColumns,
    accountId: uuid("account_id")
      .notNull()
      .references(() => accountTable.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    amount: integer("amount").notNull(),
    currency: currencyEnum("currency").notNull(),
    info: text("info"),
    source: transactionSourceEnum("source").notNull().default("manual"),
    isCountable: boolean("is_countable").notNull().default(true),
    usdAmount: integer("usd_amount").notNull(),
    type: transactionTypeEnum("type").notNull().default("expense"),
  },
  (table) => [
    index("idx_transaction_account_id").on(table.accountId),
    index("idx_transaction_account_id_created_at").on(
      table.accountId,
      table.createdAt,
    ),
    index("idx_transaction_type").on(table.type),
  ],
);

export const inviteTable = pgTable(
  "invite",
  {
    ...sharedColumns,
    familyId: uuid("family_id").notNull(),
    invitedByUserId: uuid("invited_by_user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    code: varchar("code").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    usedByUserId: uuid("used_by_user_id").references(() => userTable.id),
  },
  (table) => [
    index("idx_invite_code").on(table.code),
    index("idx_invite_family_id").on(table.familyId),
  ],
);

export const transactionImportRuleTable = pgTable(
  "transaction_import_rule",
  {
    name: varchar("name").notNull(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accountTable.id, { onDelete: "cascade" }),
    type: transactionImportRuleTypeEnum("type").notNull(),
  },
  (table) => [
    index("idx_transaction_import_rule_account_id").on(table.accountId),
  ],
);
