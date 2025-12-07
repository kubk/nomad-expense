import type { SupportedCurrency } from "./currency";
import { fetchMockRate } from "./exchange-rate-mock-api";

type ExchangeRates = Record<string, number>;

type ExchangeRateResponse = {
  date: string;
} & Record<string, ExchangeRates>;

type RateFetcher = (
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
  date: Date,
) => Promise<number | null>;

const JSDELIVR_BASE_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api";
const CLOUDFLARE_BASE_URL = "https://{date}.currency-api.pages.dev";

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

function extractRate(
  data: ExchangeRateResponse,
  fromCurrency: string,
  toCurrency: string,
): number | null {
  const rates = data[fromCurrency.toLowerCase()];
  if (!rates || typeof rates[toCurrency.toLowerCase()] !== "number") {
    return null;
  }
  return rates[toCurrency.toLowerCase()];
}

function createApiFetcher(
  fetcher: (
    baseCurrency: string,
    date: Date | "latest",
  ) => Promise<ExchangeRateResponse>,
): RateFetcher {
  return async (fromCurrency, toCurrency, date) => {
    try {
      const data = await fetcher(fromCurrency.toLowerCase(), date);
      return extractRate(data, fromCurrency, toCurrency);
    } catch {
      return null;
    }
  };
}

const fetchJsDelivrRate = createApiFetcher(fetchFromJsDelivr);
const fetchCloudflareRate = createApiFetcher(fetchFromCloudflare);

// Rate fetchers in order of priority
const RATE_FETCHERS: RateFetcher[] = [
  fetchJsDelivrRate,
  fetchCloudflareRate,
  fetchMockRate,
];

// In-memory cache for exchange rates
// Key format: "fromCurrency:toCurrency:YYYY-MM-DD"
const exchangeRateCache = new Map<string, number>();

function getCacheKey(
  fromCurrency: string,
  toCurrency: string,
  date: Date,
): string {
  return `${fromCurrency.toLowerCase()}:${toCurrency.toLowerCase()}:${formatDateForApi(date)}`;
}

async function fetchExchangeRate(
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
  date: Date,
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  const cacheKey = getCacheKey(fromCurrency, toCurrency, date);
  const cachedRate = exchangeRateCache.get(cacheKey);
  if (cachedRate !== undefined) {
    return cachedRate;
  }

  for (const fetcher of RATE_FETCHERS) {
    const rate = await fetcher(fromCurrency, toCurrency, date);
    if (rate !== null) {
      exchangeRateCache.set(cacheKey, rate);
      return rate;
    }
  }

  throw new Error(
    `Unable to fetch exchange rate for ${fromCurrency} -> ${toCurrency}`,
  );
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

  const resolvedDate = date === "latest" ? new Date() : date;
  const rate = await fetchExchangeRate(fromCurrency, toCurrency, resolvedDate);

  // Convert cents to dollars for calculation
  const dollarAmount = amountInCents / 100;
  const convertedAmount = dollarAmount * rate;

  // Return as cents (rounded)
  return Math.round(convertedAmount * 100);
}
