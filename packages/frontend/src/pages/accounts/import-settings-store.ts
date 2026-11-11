import { makeAutoObservable } from "mobx";
import { formToPlain, TextField } from "mobx-form-lite";
import { makeMutation } from "mobx-query-lite";
import type { Account, Bank } from "api";
import { api } from "@/shared/api";
import { routerStore } from "@/shared/stacked-router/router-store";
import { accountsStore } from "@/store/accounts-store";

export class ImportSettingsStore {
  form: {
    bankType: TextField<Bank | "None">;
    timezone: TextField<string>;
  };
  updateMutation = makeMutation(api.accounts.updateImportSettings.mutate);

  constructor(
    private accountId: string,
    existingAccount: Account | undefined,
  ) {
    this.form = {
      bankType: new TextField<Bank | "None">(
        existingAccount?.bankType || "None",
      ),
      timezone: new TextField(existingAccount?.timezone || "UTC"),
    };
    makeAutoObservable<this, "accountId">(
      this,
      { accountId: false },
      { autoBind: true },
    );
  }

  async save() {
    const { bankType, timezone } = formToPlain(this.form);
    const result = await this.updateMutation.mutateResult({
      id: this.accountId,
      bankType: bankType === "None" ? null : bankType,
      timezone,
    });
    if (result.ok) {
      accountsStore.accountsQuery.invalidate();
      routerStore.pop();
    }
  }
}
