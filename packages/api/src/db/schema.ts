import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { z } from "zod";

const transactionSource = ["imported", "manual"] as const;
export const transactionSourceSchema = z.enum(transactionSource);

const transactionImportRuleType = [
  "MakeUncountable",
  "FilterTransactionName",
] as const;

const transactionType = ["expense", "income"] as const;
export const transactionTypeSchema = z.enum(transactionType);

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

export const accountColorSchema = z.enum(accountColor);

const bank = ["Wise", "YapiKredi", "Kasikorn"] as const;

export const currency = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CNY",
  "CAD",
  "AUD",
  "CHF",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "CZK",
  "HUF",
  "RUB",
  "INR",
  "KRW",
  "SGD",
  "HKD",
  "NZD",
  "MXN",
  "BRL",
  "ZAR",
  "THB",
  "USDT",
  "BTC",
  "ETH",
] as const;

export const currencySchema = z.enum(currency);

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
    currency: text("currency", { enum: currency }).notNull(),
    color: text("color", { enum: accountColor }).notNull(),
    bankType: text("bank_type", { enum: bank }),
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
    currency: text("currency", { enum: currency }).notNull(),
    info: text("info"), // Optional payload
    source: text("source", { enum: transactionSource })
      .notNull()
      .default(transactionSourceSchema.enum.manual),
    isCountable: integer("is_countable", { mode: "boolean" })
      .notNull()
      .default(true),
    usdAmount: integer("usd_amount").notNull(),
    type: text("type", { enum: transactionType }).notNull().default("expense"),
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

export const transactionImportRuleTable = sqliteTable(
  "transaction_import_rule",
  {
    name: text("name").notNull(),
    accountId: text("account_id")
      .notNull()
      .references(() => accountTable.id, { onDelete: "cascade" }),
    type: text("type", { enum: transactionImportRuleType }).notNull(),
  },
  (table) => [
    index("idx_transaction_import_rule_account_id").on(table.accountId),
  ],
);
