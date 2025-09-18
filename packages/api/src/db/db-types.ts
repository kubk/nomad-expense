import {
  accountTable,
  transactionImportRuleTable,
  transactionTable,
} from "./schema";
import { InferSelectModel } from "drizzle-orm";

export type AccountSelect = InferSelectModel<typeof accountTable>;
export type TransactionImportRule = InferSelectModel<
  typeof transactionImportRuleTable
>;
export type Transaction = InferSelectModel<typeof transactionTable>;
