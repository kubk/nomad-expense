import { createRoutes } from "typesafe-routes";

export const routes = createRoutes({
  overview: {
    path: [],
  },
  transactions: {
    path: ["transactions"],
  },
  monthlyBreakdownFull: {
    path: ["monthly-breakdown-full"],
  },
  accounts: {
    path: ["accounts"],
  },
  settings: {
    path: ["settings"],
  },
});

export type RouteKey = keyof typeof routes;
