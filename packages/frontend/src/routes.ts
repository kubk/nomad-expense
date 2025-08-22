import { createRoutes, param, str } from "typesafe-routes";
import type { TransactionFilters } from "api";

const transactionFilters = param({
  serialize: (value: TransactionFilters) => JSON.stringify(value),
  parse: (value: string) => JSON.parse(value) as TransactionFilters,
});

export const routes = createRoutes({
  overview: {
    path: [],
  },
  transactions: {
    path: ["transactions"],
    query: [transactionFilters("filters")],
  },
  monthlyBreakdownFull: {
    path: ["monthly-breakdown-full"],
    query: [transactionFilters("filters")],
  },
  accounts: {
    path: ["accounts"],
  },
  accountForm: {
    path: ["accounts", "form"],
    query: [str.optional("accountId")],
  },
  settings: {
    path: ["settings"],
  },
});
