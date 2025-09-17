import { convert, SupportedCurrency } from "./currency-converter";

export type MoneyFull = {
  type: "full";
  amountCents: number;
  currency: SupportedCurrency;
  baseAmountCents: number;
  baseCurrency: SupportedCurrency;
};

export function createMoneyFullFromHuman({
  amountHuman,
  currency,
  // For now we keep USD hardcoded until we implement proper currency conversion
  baseCurrency = "USD",
}: {
  amountHuman: number;
  currency: SupportedCurrency;
  baseCurrency?: SupportedCurrency;
}): MoneyFull {
  const amountCents = Math.round(amountHuman * 100);
  return {
    type: "full" as const,
    amountCents,
    currency,
    baseCurrency,
    baseAmountCents: convert(amountCents, currency, baseCurrency),
  };
}
