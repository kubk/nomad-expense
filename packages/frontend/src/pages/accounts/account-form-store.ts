import { makeAutoObservable } from "mobx";
import { formToPlain, isFormValid, TextField } from "mobx-form-lite";
import { makeMutation } from "mobx-query-lite";
import type { Account, AccountColor, SupportedCurrency } from "api";
import { api } from "@/shared/api";
import { haptic } from "@/shared/platform/haptics";
import { requiredText } from "@/shared/validators";
import { routerStore } from "@/shared/stacked-router/router-store";
import { accountsStore } from "@/store/accounts-store";
import { accountColorsPalette } from "./account-colors";

const selectionHaptic = { afterChange: () => haptic("selection") };

export class AccountFormStore {
  form: {
    name: TextField<string>;
    color: TextField<AccountColor>;
    currency: TextField<SupportedCurrency>;
  };
  isDeleteConfirmOpen = false;
  createMutation = makeMutation(api.accounts.create.mutate);
  updateMutation = makeMutation(api.accounts.update.mutate);
  deleteMutation = makeMutation(api.accounts.delete.mutate);

  constructor(private existingAccount: Account | undefined) {
    this.form = {
      name: new TextField(existingAccount?.name ?? "", {
        validate: requiredText,
      }),
      color: new TextField(
        existingAccount?.color ?? accountColorsPalette[0].id,
        selectionHaptic,
      ),
      currency: new TextField(
        existingAccount?.currency ?? "USD",
        selectionHaptic,
      ),
    };
    makeAutoObservable<this, "existingAccount">(
      this,
      { existingAccount: false },
      { autoBind: true },
    );
  }

  get isValid() {
    return isFormValid(this.form);
  }

  get isSaving() {
    return this.createMutation.isPending || this.updateMutation.isPending;
  }

  setDeleteConfirmOpen(open: boolean) {
    this.isDeleteConfirmOpen = open;
  }

  async save() {
    haptic("light");
    const accountId = this.existingAccount?.id;
    const { name, color, currency } = formToPlain(this.form);
    const result = accountId
      ? await this.updateMutation.mutateResult({
          id: accountId,
          name,
          color,
        })
      : await this.createMutation.mutateResult({ name, color, currency });
    if (!result.ok) {
      console.error("Failed to save account:", result.error);
      return;
    }

    accountsStore.accountsQuery.invalidate();
    routerStore.pop();
  }

  async delete() {
    const accountId = this.existingAccount?.id;
    if (!accountId) return;

    const result = await this.deleteMutation.mutateResult({ id: accountId });
    if (!result.ok) {
      console.error("Failed to delete account:", result.error);
      return;
    }

    accountsStore.accountsQuery.invalidate();
    routerStore.navigate({ type: "accounts" });
    this.isDeleteConfirmOpen = false;
  }
}
