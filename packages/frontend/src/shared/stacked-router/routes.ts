import * as v from "valibot";

const toNumberSchema = v.pipe(v.unknown(), v.transform(Number), v.number());

const transactionFiltersSchema = v.object({
  accounts: v.array(v.string()),
  description: v.optional(
    v.object({
      input: v.string(),
      type: v.union([v.literal("includes"), v.literal("exact")]),
    }),
  ),
  date: v.variant("type", [
    v.object({
      type: v.literal("months"),
      value: toNumberSchema,
    }),
    v.object({
      type: v.literal("custom"),
      value: v.array(
        v.object({
          year: toNumberSchema,
          month: toNumberSchema,
        }),
      ),
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
    type: v.literal("accounts"),
  }),
  v.object({
    type: v.literal("accountForm"),
    accountId: v.optional(v.string()),
  }),
  v.object({
    type: v.literal("accountPicker"),
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
]);

export type Route = v.InferOutput<typeof routeSchema>;
