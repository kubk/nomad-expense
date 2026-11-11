import { makeAutoObservable } from "mobx";
import { makeQuery } from "mobx-query-lite";
import type { TransactionFilters } from "api";
import { apiProxy } from "@/shared/api";
import { accountsStore } from "@/store/accounts-store";
import { FiltersState } from "../widgets/filters-form-store";

export class TransactionsScreenStore {
  filtersState: FiltersState;
  transactionsQuery = makeQuery(() =>
    apiProxy.expenses.transactionsList.query(this.filtersState.filters),
  );

  constructor(appliedFilters: TransactionFilters | undefined) {
    this.filtersState = new FiltersState("transactions", appliedFilters);
    makeAutoObservable(this, { filtersState: false }, { autoBind: true });
  }

  get data() {
    return this.transactionsQuery.data;
  }

  get isLoading() {
    return this.transactionsQuery.isPending;
  }

  get transactions() {
    return this.data?.transactions ?? [];
  }

  get accountCount() {
    return (
      this.filtersState.filters.accounts?.length ??
      accountsStore.accounts.length
    );
  }
}
