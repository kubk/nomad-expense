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
  transactionForm: {
    path: ["transactions", "form"],
    query: [str.optional("transactionId")],
  },
  settings: {
    path: ["settings"],
  },
  family: {
    path: ["family"],
  },
  invite: {
    path: ["invite"],
    query: [str("code")],
  },
});
