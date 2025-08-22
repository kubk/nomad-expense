import { router } from "./trpc/router";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

export type ApiRouter = typeof router;
export type RouterInputs = inferRouterInputs<ApiRouter>;
export type RouterOutputs = inferRouterOutputs<ApiRouter>;

export type MonthlyBreakdownFilters = RouterInputs["expenses"]["transactions"];
export type MonthlyBreakdownFull = RouterOutputs["expenses"]["transactions"];
