import z from "zod";
import { router } from "./api/router";
export {
  type SupportedCurrency,
  SUPPORTED_CURRENCIES,
} from "./services/money/currency";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import {
  accountColorSchema,
  bank,
  bankSchema,
  currencySchema,
  transactionType,
  transactionTypeSchema,
} from "./db/enums";

export type ApiRouter = typeof router;
type RouterInputs = inferRouterInputs<ApiRouter>;
export type RouterOutputs = inferRouterOutputs<ApiRouter>;

export type TransactionFilters =
  RouterInputs["expenses"]["transactionsByMonth"];
type MonthlyBreakdownFull = RouterOutputs["expenses"]["transactionsByMonth"];
type TransactionsList = RouterOutputs["expenses"]["transactionsList"];

export type Transaction = TransactionsList["transactions"][0];
export type Account = RouterOutputs["accounts"]["list"][0];
export type MonthlyData = MonthlyBreakdownFull["data"][0];

export type AccountColor = z.infer<typeof accountColorSchema>;
export { bank, transactionType };
export type Bank = z.infer<typeof bankSchema>;
export type Currency = z.infer<typeof currencySchema>;
export type TransactionType = z.infer<typeof transactionTypeSchema>;

export { telegramAuthMethod } from "./services/auth/telegram-auth-method";

export { type UploadHandlerResponse } from "./api/upload-statement-handler";

export { type UserLike, getUserDisplayName } from "./services/user-display";

export { links } from "./bot/messages";

export { createPlural } from "./translations/plural";

export {
  translate,
  type TranslationArgs,
  type TranslationOf,
} from "./translations/translate";
