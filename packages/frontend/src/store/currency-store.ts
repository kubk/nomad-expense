import { makeAutoObservable } from "mobx";
import { makePersistable } from "mobx-persist-store";
import {
  convert,
  formatAmount,
  getSupportedCurrencies,
  SupportedCurrency,
} from "../shared/currency-converter";

export class CurrencyStore {
  baseCurrency: SupportedCurrency = "USD";

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });

    makePersistable(this, {
      name: "expense-tracker-currency-store",
      properties: ["baseCurrency"],
      storage: window.localStorage,
    });
  }

  setBaseCurrency(currency: SupportedCurrency) {
    if (this.isValidCurrency(currency)) {
      this.baseCurrency = currency;
    }
  }

  convertToBase(amount: number, fromCurrency: SupportedCurrency): number {
    return convert(amount, fromCurrency, this.baseCurrency);
  }

  convertFromBase(amount: number, toCurrency: SupportedCurrency): number {
    return convert(amount, this.baseCurrency, toCurrency);
  }

  formatBaseCurrency(
    amountInCents: number,
    options?: { showFractions?: boolean },
  ): string {
    return formatAmount(amountInCents, this.baseCurrency, options);
  }

  private isValidCurrency(currency: string): boolean {
    return getSupportedCurrencies().some((c) => c.code === currency);
  }
}

export const currencyStore = new CurrencyStore();
