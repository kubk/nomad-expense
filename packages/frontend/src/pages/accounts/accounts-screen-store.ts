import { makeAutoObservable } from "mobx";
import { makeMutation } from "mobx-query-lite";
import { toast } from "sonner";
import type { Account } from "api";
import { api } from "@/shared/api";
import { haptic } from "@/shared/platform/haptics";
import { routerStore } from "@/shared/stacked-router/router-store";
import { accountsStore } from "@/store/accounts-store";
import { t } from "@/translations/translation-store";

export class AccountsScreenStore {
  reorderedAccounts: Account[] | null = null;
  showHiddenAccounts = false;
  setHiddenMutation = makeMutation(api.accounts.setHidden.mutate);
  reorderMutation = makeMutation(api.accounts.reorder.mutate);

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isReorderMode() {
    return this.reorderedAccounts !== null;
  }

  get hiddenAccounts() {
    return accountsStore.accounts.filter((account) => account.isHidden);
  }

  get visibleAccounts() {
    return (
      this.reorderedAccounts ??
      accountsStore.accounts.filter((account) => !account.isHidden)
    );
  }

  openAccount(accountId: string) {
    if (this.isReorderMode) return;
    haptic("selection");
    routerStore.navigate({ type: "accountForm", accountId });
  }

  addAccount() {
    haptic("light");
    routerStore.navigate({ type: "accountForm" });
  }

  startReorder() {
    // A copy, as reordering moves accounts in place
    this.reorderedAccounts = this.visibleAccounts.slice();
  }

  cancelReorder() {
    this.reorderedAccounts = null;
  }

  moveAccount(index: number, direction: "up" | "down") {
    const accounts = this.reorderedAccounts;
    if (!accounts) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= accounts.length) return;

    haptic("selection");
    const [account] = accounts.splice(index, 1);
    accounts.splice(targetIndex, 0, account);
  }

  async saveReorder() {
    const reorderedAccounts = this.reorderedAccounts;
    if (!reorderedAccounts) return;

    // Hidden accounts keep their slots; visible ones take the new order
    let visibleAccountIndex = 0;
    const accountIds = accountsStore.accounts.map((account) => {
      if (account.isHidden) return account.id;
      const reorderedAccount = reorderedAccounts[visibleAccountIndex];
      visibleAccountIndex += 1;
      return reorderedAccount?.id ?? account.id;
    });

    const result = await this.reorderMutation.mutateResult({ accountIds });
    if (result.ok) {
      await accountsStore.accountsQuery.invalidate();
      this.reorderedAccounts = null;
    }
  }

  hideAccount(accountId: string) {
    haptic("heavy");
    this.setHidden(accountId, true);
  }

  unhideAccount(accountId: string) {
    haptic("selection");
    if (this.hiddenAccounts.length === 1) {
      this.showHiddenAccounts = false;
    }
    this.setHidden(accountId, false);
  }

  toggleHiddenAccounts() {
    haptic("selection");
    this.showHiddenAccounts = !this.showHiddenAccounts;
  }

  async setHidden(id: string, isHidden: boolean) {
    // Optimistic update, then resync with the server whatever the result
    accountsStore.accountsQuery.setData(
      accountsStore.accounts.map((account) =>
        account.id === id ? { ...account, isHidden } : account,
      ),
    );
    const result = await this.setHiddenMutation.mutateResult({ id, isHidden });
    if (!result.ok) {
      haptic("error");
      toast.error(t("somethingWentWrong"));
    }
    await accountsStore.accountsQuery.invalidate();
  }
}
