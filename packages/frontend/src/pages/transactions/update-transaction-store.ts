import { makeAutoObservable } from "mobx";
import {
  BooleanField,
  formToPlain,
  isFormValid,
  TextField,
} from "mobx-form-lite";
import { makeMutation, makeQuery } from "mobx-query-lite";
import { DateTime } from "luxon";
import type { RouterOutputs, TransactionType } from "api";
import { api, apiProxy } from "@/shared/api";
import { invalidateTransactions } from "@/shared/invalidate-queries";
import { haptic } from "@/shared/platform/haptics";
import { positiveAmount, requiredText } from "@/shared/validators";
import { routerStore } from "@/shared/stacked-router/router-store";
import { accountsStore } from "@/store/accounts-store";

export function makeTransactionQuery(transactionId: string) {
  return makeQuery(
    apiProxy.expenses.getTransaction.query({ id: transactionId }),
  );
}

type TransactionDetails = NonNullable<
  RouterOutputs["expenses"]["getTransaction"]
>;

function createTransactionForm(transaction: TransactionDetails | undefined) {
  const createdAt = transaction
    ? DateTime.fromISO(transaction.createdAt)
    : DateTime.now();
  return {
    description: new TextField(transaction?.description ?? "", {
      validate: requiredText,
    }),
    amount: new TextField(
      transaction ? (transaction.amount / 100).toString() : "",
      { validate: positiveAmount },
    ),
    date: new TextField<Date | undefined>(createdAt.toJSDate(), {
      afterChange: () => haptic("selection"),
    }),
    time: new TextField(createdAt.toFormat("HH:mm")),
    type: new TextField<TransactionType>(transaction?.type ?? "expense"),
    isExcludedFromTotals: new BooleanField(
      transaction ? !transaction.isCountable : false,
    ),
  };
}

export class UpdateTransactionStore {
  form: ReturnType<typeof createTransactionForm>;
  isDeleteConfirmOpen = false;
  updateMutation = makeMutation(api.expenses.updateTransaction.mutate);
  deleteMutation = makeMutation(api.expenses.deleteTransaction.mutate);
  repeatMutation = makeMutation(api.expenses.createTransaction.mutate);

  constructor(
    private transactionId: string,
    readonly transaction: TransactionDetails | undefined,
  ) {
    this.form = createTransactionForm(transaction);
    makeAutoObservable<this, "transactionId">(
      this,
      { transactionId: false, transaction: false },
      { autoBind: true },
    );
  }

  get isLoading() {
    return !this.transaction;
  }

  get account() {
    return accountsStore.findAccount(this.transaction?.accountId);
  }

  get isSaving() {
    return this.updateMutation.isPending || this.repeatMutation.isPending;
  }

  get canSave() {
    return isFormValid(this.form) && !this.isSaving && !this.isLoading;
  }

  setExcludedFromTotals(isExcluded: boolean) {
    haptic("selection");
    this.form.isExcludedFromTotals.setValue(isExcluded);
  }

  setDeleteConfirmOpen(open: boolean) {
    this.isDeleteConfirmOpen = open;
  }

  get createdAt() {
    const date = this.form.date.value;
    const time = this.form.time.value;
    if (!date || !time) {
      return new Date().toISOString();
    }
    const [hour, minute] = time.split(":");
    return (
      DateTime.fromJSDate(date)
        .set({ hour: parseInt(hour), minute: parseInt(minute), second: 0 })
        .toISO() || new Date().toISOString()
    );
  }

  async save() {
    haptic("light");
    const { description, amount, type, isExcludedFromTotals } = formToPlain(
      this.form,
    );
    const result = await this.updateMutation.mutateResult({
      id: this.transactionId,
      description,
      amount: parseFloat(amount),
      createdAt: this.createdAt,
      type,
      isCountable: !isExcludedFromTotals,
    });
    if (!result.ok) return;

    invalidateTransactions();
    makeTransactionQuery(this.transactionId).invalidate();
    routerStore.pop();
  }

  async delete() {
    const result = await this.deleteMutation.mutateResult({
      id: this.transactionId,
    });
    if (!result.ok) return;

    invalidateTransactions();
    routerStore.pop();
  }

  async repeat() {
    if (!this.transaction || !isFormValid(this.form)) return;

    const { description, amount, type } = formToPlain(this.form);
    const result = await this.repeatMutation.mutateResult({
      accountId: this.transaction.accountId,
      description,
      amount: parseFloat(amount),
      type,
      createdAt: new Date().toISOString(),
    });
    if (!result.ok) return;

    invalidateTransactions();
    accountsStore.accountsQuery.invalidate();
    routerStore.pop();
  }
}
