import type { SupportedCurrency } from "./currency-converter";

type ExchangeRates = Record<string, number>;

type ExchangeRateResponse = {
  date: string;
} & Record<string, ExchangeRates>;

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

export async function fetchExchangeRate(
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
  date: Date | "latest" = "latest",
): Promise<number> {
  const fromLower = fromCurrency.toLowerCase();
  const toLower = toCurrency.toLowerCase();

  if (fromCurrency === toCurrency) {
    return 1;
  }

  let data: ExchangeRateResponse;

  try {
    data = await fetchFromJsDelivr(fromLower, date);
  } catch (jsDelivrError) {
    console.warn(
      "jsDelivr API failed, trying Cloudflare fallback:",
      jsDelivrError,
    );
    try {
      data = await fetchFromCloudflare(fromLower, date);
    } catch (cloudflareError) {
      console.error("Both exchange rate APIs failed:", cloudflareError);
      throw new Error(
        `Failed to fetch exchange rate for ${fromCurrency} to ${toCurrency}`,
      );
    }
  }

  const rates = data[fromLower];
  if (!rates || typeof rates[toLower] !== "number") {
    throw new Error(
      `Exchange rate not found for ${fromCurrency} to ${toCurrency}`,
    );
  }

  return rates[toLower];
}

export async function convertWithLiveRate(
  amountInCents: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
  date: Date | "latest" = "latest",
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
