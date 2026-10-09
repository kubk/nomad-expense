import * as v from "valibot";
import { transactionType } from "api";

const toPositiveNumberSchema = v.pipe(
  v.unknown(),
  v.transform(Number),
  v.number(),
  v.check((value) => value > 0, "Must be positive"),
);

const transactionFiltersSchema = v.object({
  accounts: v.array(v.string()),
  transactionType: v.optional(v.picklist(transactionType)),
  description: v.optional(
    v.object({
      input: v.string(),
      type: v.union([v.literal("includes"), v.literal("exact")]),
    }),
  ),
  date: v.variant("type", [
    v.object({ type: v.literal("all") }),
    v.object({
      type: v.literal("days"),
      value: toPositiveNumberSchema,
    }),
    v.object({
      type: v.literal("range"),
      from: v.string(),
      to: v.string(),
      timezone: v.string(),
    }),
    v.object({
      type: v.literal("months"),
      value: toPositiveNumberSchema,
    }),
  ]),
  order: v.object({
    field: v.union([v.literal("createdAt"), v.literal("amount")]),
    direction: v.union([v.literal("asc"), v.literal("desc")]),
  }),
});

export const routeSchema = v.variant("type", [
  v.object({
    type: v.literal("main"),
  }),
  v.object({
    type: v.literal("transactions"),
    filters: v.optional(transactionFiltersSchema),
  }),
  v.object({
    type: v.literal("monthlyBreakdownFull"),
    filters: v.optional(transactionFiltersSchema),
  }),
  v.object({
    type: v.literal("monthlyBreakdownSettings"),
  }),
  v.object({
    type: v.literal("monthlyBreakdownAccounts"),
  }),
  v.object({
    type: v.literal("accounts"),
  }),
  v.object({
    type: v.literal("accountForm"),
    accountId: v.optional(v.string()),
  }),
  v.object({
    type: v.literal("importSettings"),
    accountId: v.string(),
  }),
  v.object({
    type: v.literal("transactionForm"),
    transactionId: v.optional(v.string()),
    accountId: v.optional(v.string()),
  }),
  v.object({
    type: v.literal("settings"),
  }),
  v.object({
    type: v.literal("family"),
  }),
  v.object({
    type: v.literal("invite"),
    code: v.string(),
  }),
  v.object({
    type: v.literal("auth"),
  }),
  v.object({
    type: v.literal("statementUploadResult"),
    key: v.string(),
  }),
]);

export type Route = v.InferOutput<typeof routeSchema>;

export function isFormRoute(route: Route) {
  return (
    route.type === "accountForm" ||
    route.type === "importSettings" ||
    route.type === "transactionForm" ||
    route.type === "monthlyBreakdownSettings" ||
    route.type === "monthlyBreakdownAccounts" ||
    route.type === "settings" ||
    route.type === "family"
  );
}
