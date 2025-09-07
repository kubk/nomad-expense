import { SupportedCurrency, CurrencyInfo, SUPPORTED_CURRENCIES } from "api";

export function getCurrencySymbol(currencyCode: SupportedCurrency): string {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
  return currency?.symbol || currencyCode;
}

export function getCurrencyInfo(
  currencyCode: SupportedCurrency,
): CurrencyInfo | undefined {
  return SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
}

// Format amount with currency symbol (amount in cents)
export function formatAmount(
  amountInCents: number,
  currency: SupportedCurrency,
  options: { showFractions?: boolean } = { showFractions: true },
): string {
  // Convert from integer cents to decimal amount
  const decimalAmount = amountInCents / 100;
  const { showFractions = true } = options;

  // Handle crypto currencies that aren't supported by Intl.NumberFormat
  if (["USDT", "BTC", "ETH"].includes(currency)) {
    const symbol = getCurrencySymbol(currency);
    const formattedAmount = showFractions
      ? decimalAmount.toFixed(2)
      : Math.round(decimalAmount).toString();
    return `${symbol}${formattedAmount}`;
  }

  // non Russian locales don't know about the RUB symbol
  const locale = currency === "RUB" ? "ru-RU" : undefined;

  // Use Intl.NumberFormat for all standard currencies
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: showFractions ? 2 : 0,
    maximumFractionDigits: showFractions ? 2 : 0,
  }).format(decimalAmount);
}
