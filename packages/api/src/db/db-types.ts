import {
  accountTable,
  bankConnectionTable,
  transactionImportRuleTable,
  transactionTable,
} from "./schema";
import { InferSelectModel } from "drizzle-orm";

export type AccountSelect = InferSelectModel<typeof accountTable>;
export type TransactionImportRule = InferSelectModel<
  typeof transactionImportRuleTable
>;
export type TransactionFull = InferSelectModel<typeof transactionTable>;
export type BankConnection = InferSelectModel<typeof bankConnectionTable>;
