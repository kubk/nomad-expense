import { invalidateQueries } from "mobx-query-lite";

export function invalidateTransactions() {
  return Promise.all([
    invalidateQueries({ key: ["expenses", "transactionsList"] }),
    invalidateQueries({ key: ["expenses", "overview"] }),
    invalidateQueries({ key: ["expenses", "transactionsByMonth"] }),
  ]);
}
