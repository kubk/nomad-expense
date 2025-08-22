import { createRoutes, param } from "typesafe-routes";
import type { MonthlyBreakdownFilters } from "api";

const monthlyBreakdownFilters = param({
  serialize: (value: MonthlyBreakdownFilters) => JSON.stringify(value),
  parse: (value: string) => JSON.parse(value) as MonthlyBreakdownFilters,
});

export const routes = createRoutes({
  overview: {
    path: [],
  },
  transactions: {
    path: ["transactions"],
  },
  monthlyBreakdownFull: {
    path: ["monthly-breakdown-full"],
    query: [monthlyBreakdownFilters("filters")],
  },
  accounts: {
    path: ["accounts"],
  },
  settings: {
    path: ["settings"],
  },
});
