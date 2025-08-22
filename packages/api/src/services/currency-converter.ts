export type SupportedCurrency =
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "CNY"
  | "CAD"
  | "AUD"
  | "CHF"
  | "SEK"
  | "NOK"
  | "DKK"
  | "PLN"
  | "CZK"
  | "HUF"
  | "RUB"
  | "INR"
  | "KRW"
  | "SGD"
  | "HKD"
  | "NZD"
  | "MXN"
  | "BRL"
  | "ZAR"
  | "THB"
  | "USDT"
  | "BTC"
  | "ETH";

export type CurrencyRates = {
  [key: string]: number;
};

// Exchange rates to USD (1 USD = x target currency)
const EXCHANGE_RATES_TO_USD: CurrencyRates = {
  USD: 1.0,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 145.0,
  CNY: 7.2,
  CAD: 1.35,
  AUD: 1.45,
  CHF: 0.88,
  SEK: 10.5,
  NOK: 10.8,
  DKK: 6.9,
  PLN: 4.1,
  CZK: 23.5,
  HUF: 360.0,
  RUB: 75.0,
  INR: 83.0,
  KRW: 1320.0,
  SGD: 1.35,
  HKD: 7.8,
  NZD: 1.6,
  MXN: 17.5,
  BRL: 5.0,
  ZAR: 18.5,
  THB: 35.0,
  USDT: 1.0,
  BTC: 0.000023,
  ETH: 0.00037,
};

// For future API integration - allows updating exchange rates
let exchangeRates = { ...EXCHANGE_RATES_TO_USD };

// Convert from one currency to another (amounts in cents)
export function convert(
  amountInCents: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
): number {
  if (fromCurrency === toCurrency) {
    return amountInCents;
  }

  // Convert cents to dollars for calculation
  const dollarAmount = amountInCents / 100;

  // Convert to USD first, then to target currency
  const usdAmount = dollarAmount / exchangeRates[fromCurrency];
  const convertedAmount = usdAmount * exchangeRates[toCurrency];

  // Return as cents (rounded)
  return Math.round(convertedAmount * 100);
}

export function updateRates(newRates: Partial<CurrencyRates>): void {
  exchangeRates = {
    ...exchangeRates,
    ...(Object.fromEntries(
      Object.entries(newRates).filter(([_, value]) => value !== undefined),
    ) as CurrencyRates),
  };
}
