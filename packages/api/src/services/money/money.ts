import { convert, SupportedCurrency } from "./currency-converter";
import { convertWithLiveRate } from "./exchange-rate-api";

export type MoneyFull = {
  amountCents: number;
  currency: SupportedCurrency;
  baseAmountCents: number;
  baseCurrency: SupportedCurrency;
};

export function createMoneyFull(
  params:
    | { amountHuman: number; currency: SupportedCurrency }
    | { amountCents: number; currency: SupportedCurrency },
  baseCurrency: SupportedCurrency = "USD",
): MoneyFull {
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

export async function createMoneyFullWithLiveRate(
  params:
    | { amountHuman: number; currency: SupportedCurrency }
    | { amountCents: number; currency: SupportedCurrency },
  baseCurrency: SupportedCurrency,
  date: Date | "latest",
): Promise<MoneyFull> {
  const amountCents =
    "amountHuman" in params
      ? Math.round(params.amountHuman * 100)
      : params.amountCents;

  const baseAmountCents = await convertWithLiveRate(
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
