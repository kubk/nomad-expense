import z from "zod";
import { router } from "./api/router";
export {
  type SupportedCurrency,
  SUPPORTED_CURRENCIES,
  type CurrencyInfo,
  EXCHANGE_RATES_TO_USD,
  convert,
} from "./services/money/currency-converter";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import {
  accountColorSchema,
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
export type Currency = z.infer<typeof currencySchema>;
export type TransactionType = z.infer<typeof transactionTypeSchema>;
export type TransactionSource = z.infer<typeof transactionSourceSchema>;

export { telegramAuthMethod } from "./services/auth/telegram-auth-method";

export { type UploadHandlerResponse } from "./api/upload-statement-handler";
