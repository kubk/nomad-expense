import { makeAutoObservable } from "mobx";
import { invalidateQueries, makeMutation } from "mobx-query-lite";
import { toast } from "sonner";
import type { Currency } from "api";
import { api } from "@/shared/api";
import { haptic } from "@/shared/platform/haptics";
import { familyStore } from "@/store/family-store";
import { t } from "@/translations/translation-store";

export class BaseCurrencySettingStore {
  pendingCurrency: Currency | null = null;
  updateCurrencyMutation = makeMutation(api.family.updateBaseCurrency.mutate);

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isUpdating() {
    return this.updateCurrencyMutation.isPending;
  }

  selectCurrency(currency: Currency) {
    haptic("selection");
    this.pendingCurrency = currency;
  }

  cancel() {
    this.pendingCurrency = null;
  }

  async confirm() {
    if (!this.pendingCurrency) return;

    const result = await this.updateCurrencyMutation.mutateResult({
      baseCurrency: this.pendingCurrency,
    });
    if (!result.ok) {
      const message = result.error instanceof Error ? result.error.message : "";
      toast.error(message || t("baseCurrencyUpdateFailed"));
      return;
    }

    familyStore.baseCurrencyQuery.invalidate();
    invalidateQueries({ key: ["expenses", "overview"] });
    invalidateQueries({ key: ["expenses", "transactionsByMonth"] });
    this.pendingCurrency = null;
  }
}
