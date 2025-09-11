import { z } from "zod";

export const transactionSource = ["imported", "manual"] as const;
export const transactionSourceSchema = z.enum(transactionSource);

export const transactionImportRuleType = [
  "MakeUncountable",
  "FilterTransactionName",
] as const;

export const transactionType = ["expense", "income"] as const;
export const transactionTypeSchema = z.enum(transactionType);

export const accountColor = [
  "blue",
  "green",
  "purple",
  "red",
  "orange",
  "yellow",
  "pink",
  "teal",
  "cyan",
  "lime",
  "amber",
  "emerald",
  "rose",
  "gray",
] as const;

export const accountColorSchema = z.enum(accountColor);

export const bank = ["Wise", "YapiKredi", "Kasikorn", "Tinkoff"] as const;
export const bankSchema = z.enum(bank);

export const currency = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CNY",
  "CAD",
  "AUD",
  "CHF",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "CZK",
  "HUF",
  "RUB",
  "INR",
  "KRW",
  "SGD",
  "HKD",
  "NZD",
  "MXN",
  "BRL",
  "ZAR",
  "THB",
  "TRY",
  "AED",
  "BDT",
  "UAH",
  "KZT",
  "PHP",
  "MMK",
  "USDT",
  "BTC",
  "ETH",
] as const;

export const currencySchema = z.enum(currency);
