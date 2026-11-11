import { makeAutoObservable } from "mobx";
import { formReset, formToPlain, TextField } from "mobx-form-lite";
import { makeQuery } from "mobx-query-lite";
import type { TransactionFilters, TransactionType } from "api";
import { apiProxy } from "@/shared/api";
import { haptic } from "@/shared/platform/haptics";
import { routerStore } from "@/shared/stacked-router/router-store";
import { accountsStore } from "@/store/accounts-store";

// Every account, as the API reads filters without accounts
const defaultFilters: TransactionFilters = {
  date: { type: "days", value: 90 },
  order: { field: "createdAt", direction: "desc" },
};

// Filters of a screen that keeps them in its route, shared by the summary card and the filters drawer
export class FiltersState {
  isFiltersOpen = false;
  filters: TransactionFilters;

  constructor(
    private routeType: "transactions" | "monthlyBreakdownFull",
    appliedFilters: TransactionFilters | undefined,
  ) {
    this.filters = appliedFilters ?? defaultFilters;
    makeAutoObservable<this, "routeType">(
      this,
      { routeType: false },
      { autoBind: true },
    );
  }

  setFiltersOpen(open: boolean) {
    this.isFiltersOpen = open;
  }

  applyFilters(filters: TransactionFilters) {
    this.filters = filters;
    routerStore.navigate({ type: this.routeType, filters }, { replace: true });
  }
}

const selectionHaptic = { afterChange: () => haptic("selection") };

function createFiltersForm(filters: TransactionFilters) {
  return {
    description: new TextField(filters.description?.input ?? ""),
    descriptionType: new TextField<"includes" | "exact">(
      filters.description?.type ?? "includes",
      selectionHaptic,
    ),
    transactionType: new TextField<TransactionType | undefined>(
      filters.transactionType,
      selectionHaptic,
    ),
    date: new TextField(filters.date, selectionHaptic),
    // Undefined selects every account; a copy, as the drawer edits it in place
    accounts: new TextField(filters.accounts?.slice()),
    order: new TextField(filters.order, selectionHaptic),
  };
}

export class FiltersFormStore {
  form: ReturnType<typeof createFiltersForm>;
  isCustomDatePickerOpen = false;
  availableYearsQuery = makeQuery(() =>
    apiProxy.expenses.availableYears.query({
      accounts: this.form.accounts.value,
    }),
  );

  constructor(private target: FiltersState) {
    this.form = createFiltersForm(target.filters);
    makeAutoObservable<this, "target">(
      this,
      { target: false },
      { autoBind: true },
    );
  }

  get filters(): TransactionFilters {
    const { description, descriptionType, ...filters } = formToPlain(this.form);
    const input = description.trim();
    return {
      ...filters,
      description: input ? { input, type: descriptionType } : undefined,
    };
  }

  get availableYears() {
    return this.availableYearsQuery.data ?? [];
  }

  get selectedAccountCount() {
    return accountsStore.accounts.filter((account) =>
      this.isAccountSelected(account.id),
    ).length;
  }

  isAccountSelected(accountId: string) {
    return this.form.accounts.value?.includes(accountId) ?? true;
  }

  get areAllAccountsSelected() {
    return (
      accountsStore.accounts.length > 0 &&
      this.selectedAccountCount === accountsStore.accounts.length
    );
  }

  isOrderActive(order: TransactionFilters["order"]) {
    const { field, direction } = this.form.order.value;
    return field === order.field && direction === order.direction;
  }

  setOpen(open: boolean) {
    if (!open) {
      formReset(this.form);
      this.isCustomDatePickerOpen = false;
    }
    this.target.setFiltersOpen(open);
  }

  apply() {
    haptic("medium");
    this.target.applyFilters(this.filters);
    this.target.setFiltersOpen(false);
  }

  toggleAccount(accountId: string) {
    haptic("selection");
    const accounts = this.form.accounts;
    if (!accounts.value) {
      accounts.onChange(
        accountsStore.accountIds.filter((id) => id !== accountId),
      );
      return;
    }
    const index = accounts.value.indexOf(accountId);
    if (index === -1) {
      accounts.value.push(accountId);
    } else {
      accounts.value.splice(index, 1);
    }
  }

  toggleAllAccounts() {
    haptic("selection");
    this.form.accounts.onChange(this.areAllAccountsSelected ? [] : undefined);
  }

  openCustomDatePicker() {
    this.isCustomDatePickerOpen = true;
  }

  closeCustomDatePicker(date?: TransactionFilters["date"]) {
    if (date) {
      this.form.date.onChange(date);
    }
    this.isCustomDatePickerOpen = false;
  }
}
