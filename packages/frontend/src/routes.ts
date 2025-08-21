import { createRoutes, int, str } from "typesafe-routes";

export const routes = createRoutes({
  overview: {
    path: [],
  },
  transactions: {
    path: ["transactions"],
  },
  monthlyBreakdownFull: {
    path: ["monthly-breakdown-full"],
    query: [str.optional("years"), str("accounts"), int.optional("months")],
  },
  accounts: {
    path: ["accounts"],
  },
  settings: {
    path: ["settings"],
  },
});
