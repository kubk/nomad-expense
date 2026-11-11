import { makeAutoObservable } from "mobx";
import { makeQuery } from "mobx-query-lite";
import { apiProxy } from "@/shared/api";

class AccountsStore {
  accountsQuery = makeQuery(apiProxy.accounts.list.query());

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get accounts() {
    return this.accountsQuery.data ?? [];
  }

  get accountIds() {
    return this.accounts.map((account) => account.id);
  }

  get isLoading() {
    return this.accountsQuery.isPending;
  }

  findAccount(accountId: string | undefined) {
    return this.accounts.find((account) => account.id === accountId);
  }
}

export const accountsStore = new AccountsStore();
