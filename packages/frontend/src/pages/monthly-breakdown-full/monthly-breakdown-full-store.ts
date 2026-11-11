import { makeAutoObservable } from "mobx";
import { makeQuery } from "mobx-query-lite";
import type { MonthlyData, TransactionFilters } from "api";
import { apiProxy } from "@/shared/api";
import { routerStore } from "@/shared/stacked-router/router-store";
import { getTransactionMonthRange } from "@/shared/transaction-date-range";
import { monthlyBreakdownStore } from "@/store/monthly-breakdown-store";
import { FiltersState } from "../widgets/filters-form-store";

export class MonthlyBreakdownFullStore {
  filtersState: FiltersState;
  // The API leaves accounts excluded in the monthly breakdown settings out
  transactionsByMonthQuery = makeQuery(() =>
    apiProxy.expenses.transactionsByMonth.query(this.filtersState.filters),
  );

  constructor(appliedFilters: TransactionFilters | undefined) {
    this.filtersState = new FiltersState(
      "monthlyBreakdownFull",
      appliedFilters,
    );
    makeAutoObservable(this, { filtersState: false }, { autoBind: true });
  }

  get data() {
    return this.transactionsByMonthQuery.data;
  }

  get isLoading() {
    return this.transactionsByMonthQuery.isPending;
  }

  get months() {
    return this.data?.data ?? [];
  }

  // Accounts the breakdown counts: the filtered ones that the settings include
  get countedAccountIds() {
    const accounts = this.filtersState.filters.accounts;
    const includedAccountIds = monthlyBreakdownStore.includedAccountIds;
    return accounts
      ? includedAccountIds.filter((accountId) => accounts.includes(accountId))
      : includedAccountIds;
  }

  get accountCount() {
    return this.countedAccountIds.length;
  }

  // The transactions list does not apply the breakdown settings, so it gets the counted accounts explicitly
  openMonth(month: MonthlyData) {
    routerStore.navigate({
      type: "transactions",
      filters: {
        ...this.filtersState.filters,
        accounts: this.countedAccountIds,
        date: getTransactionMonthRange(month.year, month.monthNumber),
      },
    });
  }
}
