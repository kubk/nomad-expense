import type { SupportedCurrency } from "./currency";

// Static exchange rates to USD (1 USD = x target currency)
// Used for currencies without historical data
const STATIC_RATES_TO_USD: Partial<Record<SupportedCurrency, number>> = {
  USD: 1.0,
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
  INR: 83.0,
  KRW: 1320.0,
  SGD: 1.35,
  HKD: 7.8,
  NZD: 1.6,
  MXN: 17.5,
  BRL: 5.0,
  ZAR: 18.5,
  AED: 3.67,
  BDT: 110.0,
  UAH: 37.0,
  KZT: 450.0,
  PHP: 56.0,
  MMK: 2100.0,
  USDT: 1.0,
  BTC: 0.000023,
  ETH: 0.00037,
};

// EUR/USD historical rates (USD per 1 EUR) - need to invert for our format
// prettier-ignore
const EUR_USD_MONTHLY: Record<number, number[]> = {
  2020: [1.1108, 1.0919, 1.1070, 1.0870, 1.0920, 1.1250, 1.1439, 1.1825, 1.1794, 1.1769, 1.1837, 1.2163],
  2021: [1.2173, 1.2096, 1.1907, 1.1987, 1.2158, 1.2061, 1.1821, 1.1767, 1.1765, 1.1603, 1.1376, 1.1321],
  2022: [1.1325, 1.1341, 1.1010, 1.0831, 1.0569, 1.0574, 1.0203, 1.0122, 0.9918, 0.9832, 1.0204, 1.0585],
  2023: [1.0781, 1.0711, 1.0705, 1.0977, 1.0883, 1.0837, 1.1053, 1.0914, 1.0686, 1.0566, 1.0809, 1.0917],
  2024: [1.0917, 1.0794, 1.0870, 1.0726, 1.0807, 1.0765, 1.0851, 1.1015, 1.1107, 1.0904, 1.0636, 1.0479],
};

// USD/THB historical rates (THB per 1 USD)
// prettier-ignore
const USD_THB_MONTHLY: Record<number, number[]> = {
  2020: [30.37, 31.33, 32.03, 32.65, 32.09, 31.17, 31.40, 31.23, 31.34, 31.27, 30.47, 30.08],
  2021: [30.04, 30.00, 30.56, 31.35, 31.31, 31.52, 32.56, 33.03, 33.53, 33.34, 33.05, 33.35],
  2022: [33.12, 32.73, 33.18, 34.01, 34.37, 35.12, 36.27, 35.84, 36.86, 37.55, 36.15, 34.77],
  2023: [33.40, 34.09, 34.37, 34.08, 34.39, 35.05, 34.64, 35.20, 35.77, 36.15, 35.32, 34.93],
  2024: [35.14, 35.85, 35.94, 36.76, 36.63, 36.72, 36.27, 34.77, 33.32, 33.34, 34.40, 34.16],
};

// USD/TRY yearly averages (TRY per 1 USD)
const USD_TRY_YEARLY: Record<number, number> = {
  2020: 7.025,
  2021: 8.904,
  2022: 16.572,
  2023: 23.824,
  2024: 32.867,
};

// USD/RUB yearly averages (RUB per 1 USD)
const USD_RUB_YEARLY: Record<number, number> = {
  2020: 72.3,
  2021: 73.69,
  2022: 69.9,
  2023: 85.51,
  2024: 92.84,
};

// Default rates for currencies with historical data (used as fallback)
const DEFAULT_EUR_RATE = 1 / 1.08; // ~0.926 (1 USD = 0.926 EUR)
const DEFAULT_THB_RATE = 35.0;
const DEFAULT_TRY_RATE = 32.867;
const DEFAULT_RUB_RATE = 92.84;

/**
 * Get exchange rate to USD for a given currency and date
 * Returns how many units of the currency equals 1 USD
 */
function getExchangeRateToUSD(currency: SupportedCurrency, date: Date): number {
  // Static currencies - return constant rate
  if (currency in STATIC_RATES_TO_USD) {
    return STATIC_RATES_TO_USD[currency]!;
  }

  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed

  switch (currency) {
    case "EUR": {
      if (EUR_USD_MONTHLY[year]?.[month] !== undefined) {
        // EUR/USD is "USD per 1 EUR", we need "EUR per 1 USD"
        return 1 / EUR_USD_MONTHLY[year][month];
      }
      return DEFAULT_EUR_RATE;
    }
    case "THB": {
      if (USD_THB_MONTHLY[year]?.[month] !== undefined) {
        return USD_THB_MONTHLY[year][month];
      }
      return DEFAULT_THB_RATE;
    }
    case "TRY": {
      if (USD_TRY_YEARLY[year] !== undefined) {
        return USD_TRY_YEARLY[year];
      }
      return DEFAULT_TRY_RATE;
    }
    case "RUB": {
      if (USD_RUB_YEARLY[year] !== undefined) {
        return USD_RUB_YEARLY[year];
      }
      return DEFAULT_RUB_RATE;
    }
    default:
      throw new Error(`Unknown currency: ${currency}`);
  }
}

/**
 * Get mock exchange rate between two currencies
 * Returns null if unable to calculate (should never happen for supported currencies)
 */
export async function fetchMockRate(
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
  date: Date,
): Promise<number | null> {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  try {
    // Calculate rate using USD as base
    // rate = (1 / rate_to_usd[from]) * rate_to_usd[to]
    // This gives: 1 unit of fromCurrency = ? units of toCurrency
    const fromRate = getExchangeRateToUSD(fromCurrency, date);
    const toRate = getExchangeRateToUSD(toCurrency, date);
    return (1 / fromRate) * toRate;
  } catch {
    return null;
  }
}

/**
 * Convert from one currency to another using mock rates (amounts in cents)
 */
export async function convert(
  amountInCents: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
  date: Date | "latest" = new Date(),
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amountInCents;
  }

  const resolvedDate = date === "latest" ? new Date() : date;
  const rate = await fetchMockRate(fromCurrency, toCurrency, resolvedDate);
  if (rate === null) {
    throw new Error(
      `Unable to get mock rate for ${fromCurrency} -> ${toCurrency}`,
    );
  }

  const dollarAmount = amountInCents / 100;
  const convertedAmount = dollarAmount * rate;
  return Math.round(convertedAmount * 100);
}
