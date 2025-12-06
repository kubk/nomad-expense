import z from "zod";
import { router } from "./api/router";
export {
  type SupportedCurrency,
  SUPPORTED_CURRENCIES,
  type CurrencyInfo,
} from "./services/money/currency";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import {
  accountColorSchema,
  bank,
  bankSchema,
  currencySchema,
  transactionSourceSchema,
  transactionTypeSchema,
} from "./db/enums";

export type ApiRouter = typeof router;
export type RouterInputs = inferRouterInputs<ApiRouter>;
export type RouterOutputs = inferRouterOutputs<ApiRouter>;

export type TransactionFilters =
  RouterInputs["expenses"]["transactionsByMonth"];
export type MonthlyBreakdownFull =
  RouterOutputs["expenses"]["transactionsByMonth"];
export type TransactionsList = RouterOutputs["expenses"]["transactionsList"];

export type Transaction = TransactionsList["transactions"][0];
export type Account = RouterOutputs["accounts"]["list"][0];
export type MonthlyData = MonthlyBreakdownFull["data"][0];

export type AccountColor = z.infer<typeof accountColorSchema>;
export { bank };
export type Bank = z.infer<typeof bankSchema>;
export type Currency = z.infer<typeof currencySchema>;
export type TransactionType = z.infer<typeof transactionTypeSchema>;
export type TransactionSource = z.infer<typeof transactionSourceSchema>;

export { telegramAuthMethod } from "./services/auth/telegram-auth-method";

export { type UploadHandlerResponse } from "./api/upload-statement-handler";

export { type TransactionFull } from "./db/db-types";

export { type UserLike, getUserDisplayName } from "./services/user-display";

export { links } from "./bot/messages";
