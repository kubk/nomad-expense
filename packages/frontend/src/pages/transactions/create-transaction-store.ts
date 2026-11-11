import { makeAutoObservable } from "mobx";
import { formToPlain, isFormValid, TextField } from "mobx-form-lite";
import { makeMutation, makeQuery } from "mobx-query-lite";
import type { Account, TransactionType } from "api";
import { api, apiProxy } from "@/shared/api";
import { invalidateTransactions } from "@/shared/invalidate-queries";
import { haptic } from "@/shared/platform/haptics";
import { positiveAmount, requiredText } from "@/shared/validators";
import { routerStore } from "@/shared/stacked-router/router-store";
import { accountsStore } from "@/store/accounts-store";

function getDefaultManualAccount(accounts: Account[]) {
  return accounts.reduce<Account | undefined>((defaultAccount, account) => {
    if (!defaultAccount) return account;

    return account.recentManualCount > defaultAccount.recentManualCount
      ? account
      : defaultAccount;
  }, undefined);
}

function appendAmountCharacter(amount: string, character: string) {
  if (character === ".") {
    if (amount.includes(".")) return amount;
    return amount.length === 0 ? "0." : `${amount}.`;
  }

  const decimalPart = amount.split(".")[1];
  if (decimalPart?.length === 2 || amount.replace(".", "").length >= 10) {
    return amount;
  }

  if (amount === "0") return character;
  return `${amount}${character}`;
}

export class CreateTransactionStore {
  form: {
    accountId: TextField<string>;
    amount: TextField<string>;
    description: TextField<string>;
    type: TextField<TransactionType>;
  };
  createMutation = makeMutation(api.expenses.createTransaction.mutate);
  titlesQuery = makeQuery(() =>
    apiProxy.expenses.getMostUsedDescriptions.query({
      accountId: this.selectedAccount?.id ?? "",
      transactionType: this.form.type.value,
    }),
  );

  constructor(accountId: string | undefined) {
    this.form = {
      accountId: new TextField(accountId ?? ""),
      amount: new TextField("", { validate: positiveAmount }),
      description: new TextField("", { validate: requiredText }),
      type: new TextField<TransactionType>("expense"),
    };
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // Falls back to the most used manual account until the user picks one
  get selectedAccount() {
    const accounts = accountsStore.accounts;
    return (
      accountsStore.findAccount(this.form.accountId.value) ??
      getDefaultManualAccount(accounts)
    );
  }

  // Titles depend on the selected account, so they are only fetched once it is known
  get titles() {
    return this.selectedAccount ? this.titlesQuery.data : undefined;
  }

  get areAccountsLoaded() {
    return !accountsStore.isLoading && Boolean(this.selectedAccount);
  }

  get areTitlesLoaded() {
    return this.titles !== undefined;
  }

  get canSubmit() {
    return (
      this.areAccountsLoaded &&
      this.areTitlesLoaded &&
      isFormValid(this.form) &&
      !this.createMutation.isPending
    );
  }

  pressKey(key: string) {
    haptic("selection");
    const { amount } = this.form;
    amount.onChange(appendAmountCharacter(amount.value, key));
  }

  backspace() {
    haptic("selection");
    const { amount } = this.form;
    amount.onChange(amount.value.slice(0, -1));
  }

  async save() {
    const account = this.selectedAccount;
    if (!account) return;
    haptic("light");

    const { amount, description, type } = formToPlain(this.form);
    const result = await this.createMutation.mutateResult({
      // The selected account falls back to a default one the field does not hold
      accountId: account.id,
      amount: Number(amount),
      description: description.trim(),
      type,
    });
    if (!result.ok) return;

    invalidateTransactions();
    accountsStore.accountsQuery.invalidate();
    routerStore.navigate({ type: "main" });
  }
}
