export type CurrencyInfo = {
  code: SupportedCurrency;
  name: string;
  symbol: string;
};

export const supportedCurrency = [
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
  "USDT",
  "BTC",
  "ETH",
] as const;

export type SupportedCurrency = (typeof supportedCurrency)[number];

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "USDT", name: "Tether", symbol: "₮" },
  { code: "BTC", name: "Bitcoin", symbol: "₿" },
  { code: "ETH", name: "Ethereum", symbol: "Ξ" },
];

// Exchange rates to USD (1 USD = x target currency)
export const EXCHANGE_RATES_TO_USD = {
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
  const usdAmount = dollarAmount / EXCHANGE_RATES_TO_USD[fromCurrency];
  const convertedAmount = usdAmount * EXCHANGE_RATES_TO_USD[toCurrency];

  // Return as cents (rounded)
  return Math.round(convertedAmount * 100);
}
