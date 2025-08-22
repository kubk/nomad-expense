import { router } from "./trpc/router";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

export type ApiRouter = typeof router;
export type RouterInputs = inferRouterInputs<ApiRouter>;
export type RouterOutputs = inferRouterOutputs<ApiRouter>;

export type TransactionFilters =
  RouterInputs["expenses"]["transactionsByMonth"];
export type MonthlyBreakdownFull =
  RouterOutputs["expenses"]["transactionsByMonth"];
export type TransactionsList = RouterOutputs["expenses"]["transactionsList"];

// Inferred types from API responses
export type Transaction = TransactionsList["transactions"][0];
export type Account = RouterOutputs["accounts"]["list"][0];
export type MonthlyData = MonthlyBreakdownFull["data"][0];
