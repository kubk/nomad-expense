import type { SupportedCurrency } from "./currency";
import { EXCHANGE_RATES_TO_USD } from "./exchange-rate-mock-api";

type ExchangeRates = Record<string, number>;

// In-memory cache for exchange rates
// Key format: "fromCurrency:toCurrency:YYYY-MM-DD"
const exchangeRateCache = new Map<string, number>();

function getCacheKey(
  fromCurrency: string,
  toCurrency: string,
  date: Date | "latest",
): string {
  const dateStr = date === "latest" ? "latest" : formatDateForApi(date);
  return `${fromCurrency.toLowerCase()}:${toCurrency.toLowerCase()}:${dateStr}`;
}

type ExchangeRateResponse = {
  date: string;
} & Record<string, ExchangeRates>;

const JSDELIVR_BASE_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api";
const CLOUDFLARE_BASE_URL = "https://{date}.currency-api.pages.dev";

// The currency API only has data from 2024 onwards
const MIN_SUPPORTED_YEAR = 2024;

function isDateSupported(date: Date | "latest"): boolean {
  if (date === "latest") {
    return true;
  }
  return date.getFullYear() >= MIN_SUPPORTED_YEAR;
}

function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function fetchFromJsDelivr(
  baseCurrency: string,
  date: Date | "latest",
): Promise<ExchangeRateResponse> {
  const dateStr = date === "latest" ? "latest" : formatDateForApi(date);
  const url = `${JSDELIVR_BASE_URL}@${dateStr}/v1/currencies/${baseCurrency.toLowerCase()}.min.json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`jsDelivr API error: ${response.status}`);
  }
  return response.json();
}

async function fetchFromCloudflare(
  baseCurrency: string,
  date: Date | "latest",
): Promise<ExchangeRateResponse> {
  const dateStr = date === "latest" ? "latest" : formatDateForApi(date);
  const url = `${CLOUDFLARE_BASE_URL.replace("{date}", dateStr)}/v1/currencies/${baseCurrency.toLowerCase()}.min.json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Cloudflare API error: ${response.status}`);
  }
  return response.json();
}

function getFallbackRate(
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
): number {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  // Calculate rate using USD as base
  // rate = (1 / EXCHANGE_RATES_TO_USD[fromCurrency]) * EXCHANGE_RATES_TO_USD[toCurrency]
  // This gives: 1 unit of fromCurrency = ? units of toCurrency
  const rate =
    (1 / EXCHANGE_RATES_TO_USD[fromCurrency]) *
    EXCHANGE_RATES_TO_USD[toCurrency];
  return rate;
}

async function fetchExchangeRate(
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
  date: Date | "latest",
): Promise<number> {
  const fromLower = fromCurrency.toLowerCase();
  const toLower = toCurrency.toLowerCase();

  if (fromCurrency === toCurrency) {
    return 1;
  }

  // Check cache first
  const cacheKey = getCacheKey(fromCurrency, toCurrency, date);
  const cachedRate = exchangeRateCache.get(cacheKey);
  if (cachedRate !== undefined) {
    return cachedRate;
  }

  // API only supports dates from 2024 onwards, use fallback for older dates
  if (!isDateSupported(date)) {
    const fallbackRate = getFallbackRate(fromCurrency, toCurrency);
    exchangeRateCache.set(cacheKey, fallbackRate);
    return fallbackRate;
  }

  let data: ExchangeRateResponse;

  try {
    data = await fetchFromJsDelivr(fromLower, date);
  } catch (jsDelivrError) {
    try {
      data = await fetchFromCloudflare(fromLower, date);
    } catch (cloudflareError) {
      const fallbackRate = getFallbackRate(fromCurrency, toCurrency);
      exchangeRateCache.set(cacheKey, fallbackRate);
      return fallbackRate;
    }
  }

  const rates = data[fromLower];
  if (!rates || typeof rates[toLower] !== "number") {
    const fallbackRate = getFallbackRate(fromCurrency, toCurrency);
    exchangeRateCache.set(cacheKey, fallbackRate);
    return fallbackRate;
  }

  const rate = rates[toLower];
  exchangeRateCache.set(cacheKey, rate);
  return rate;
}

export async function convertWithLiveRate(
  amountInCents: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
  date: Date | "latest",
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amountInCents;
  }

  const rate = await fetchExchangeRate(fromCurrency, toCurrency, date);

  // Convert cents to dollars for calculation
  const dollarAmount = amountInCents / 100;
  const convertedAmount = dollarAmount * rate;

  // Return as cents (rounded)
  return Math.round(convertedAmount * 100);
}
