import { convert, SupportedCurrency } from "./currency-converter";

export type MoneyFull = {
  amountCents: number;
  currency: SupportedCurrency;
  baseAmountCents: number;
  baseCurrency: SupportedCurrency;
};

export function createMoneyFull(
  params:
    | { amountHuman: number; currency: SupportedCurrency }
    | { amountCents: number; currency: SupportedCurrency }
): MoneyFull {
  // For now we keep USD hardcoded until we implement proper currency conversion
  const baseCurrency = "USD";

  const amountCents =
    "amountHuman" in params
      ? Math.round(params.amountHuman * 100)
      : params.amountCents;

  return {
    amountCents,
    currency: params.currency,
    baseAmountCents: convert(amountCents, params.currency, baseCurrency),
    baseCurrency,
  };
}
