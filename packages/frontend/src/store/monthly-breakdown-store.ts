import { makeAutoObservable } from "mobx";
import { invalidateQueries, makeMutation, makeQuery } from "mobx-query-lite";
import { api, apiProxy } from "@/shared/api";
import { accountsStore } from "./accounts-store";

class MonthlyBreakdownStore {
  excludedAccountIdsQuery = makeQuery(
    apiProxy.family.getMonthlyBreakdownExcludedAccountIds.query(),
  );
  updateExcludedAccountIdsMutation = makeMutation(
    api.family.updateMonthlyBreakdownExcludedAccountIds.mutate,
  );

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get excludedAccountIds() {
    return this.excludedAccountIdsQuery.data ?? [];
  }

  get includedAccountIds() {
    const excludedAccountIds = new Set(this.excludedAccountIds);
    return accountsStore.accountIds.filter(
      (accountId) => !excludedAccountIds.has(accountId),
    );
  }

  get isLoading() {
    return accountsStore.isLoading || this.excludedAccountIdsQuery.isPending;
  }

  get isSaving() {
    return this.updateExcludedAccountIdsMutation.isPending;
  }

  async setExcludedAccountIds(excludedAccountIds: string[]) {
    const result = await this.updateExcludedAccountIdsMutation.mutateResult({
      excludedAccountIds,
    });
    if (!result.ok) {
      await this.excludedAccountIdsQuery.invalidate();
      return false;
    }

    this.excludedAccountIdsQuery.setData(result.data);
    invalidateQueries({ key: ["expenses", "overview"] });
    invalidateQueries({ key: ["expenses", "transactionsByMonth"] });
    return true;
  }
}

export const monthlyBreakdownStore = new MonthlyBreakdownStore();
