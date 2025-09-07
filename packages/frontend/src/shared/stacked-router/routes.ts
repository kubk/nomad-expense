import * as v from "valibot";

const toNumberSchema = v.pipe(v.unknown(), v.transform(Number), v.number());

const transactionFiltersSchema = v.object({
  accounts: v.array(v.string()),
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
]);

export type Route = v.InferOutput<typeof routeSchema>;
