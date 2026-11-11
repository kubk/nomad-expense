import { makeAutoObservable } from "mobx";
import { haptic } from "@/shared/platform/haptics";
import { routerStore } from "@/shared/stacked-router/router-store";
import { monthlyBreakdownStore } from "@/store/monthly-breakdown-store";

export class MonthlyBreakdownAccountsStore {
  // A copy, as toggling edits the draft in place
  draftExcludedAccountIds = monthlyBreakdownStore.excludedAccountIds.slice();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isDirty() {
    const saved = monthlyBreakdownStore.excludedAccountIds;
    const draft = this.draftExcludedAccountIds;
    if (saved.length !== draft.length) return true;

    const savedSet = new Set(saved);
    return !draft.every((accountId) => savedSet.has(accountId));
  }

  isAccountIncluded(accountId: string) {
    return !this.draftExcludedAccountIds.includes(accountId);
  }

  toggleAccount(accountId: string) {
    haptic("selection");
    const index = this.draftExcludedAccountIds.indexOf(accountId);
    if (index === -1) {
      this.draftExcludedAccountIds.push(accountId);
    } else {
      this.draftExcludedAccountIds.splice(index, 1);
    }
  }

  async save() {
    haptic("medium");
    const isSaved = await monthlyBreakdownStore.setExcludedAccountIds(
      this.draftExcludedAccountIds,
    );
    if (isSaved) {
      routerStore.pop();
    }
  }
}
