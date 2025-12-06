import type { SupportedCurrency } from "./currency-converter";
import { convertWithLiveRate } from "./exchange-rate-api";

export type MoneyFull = {
  amountCents: number;
  currency: SupportedCurrency;
  baseAmountCents: number;
  baseCurrency: SupportedCurrency;
};

export async function createMoneyFullWithLiveRate(
  params:
    | { amountHuman: number; currency: SupportedCurrency }
    | { amountCents: number; currency: SupportedCurrency },
  baseCurrency: SupportedCurrency,
  date: Date | "latest",
  converter: (
    amountInCents: number,
    fromCurrency: SupportedCurrency,
    toCurrency: SupportedCurrency,
    date: Date | "latest",
  ) => Promise<number> = convertWithLiveRate,
): Promise<MoneyFull> {
  const amountCents =
    "amountHuman" in params
      ? Math.round(params.amountHuman * 100)
      : params.amountCents;

  const baseAmountCents = await converter(
    amountCents,
    params.currency,
    baseCurrency,
    date,
  );

  return {
    amountCents,
    currency: params.currency,
    baseAmountCents,
    baseCurrency,
  };
}
