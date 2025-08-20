// Simple test script for currency conversion functionality
import { currencyService } from "./currency-service";

// Test basic conversion
console.log("Testing currency conversion:");

// Test USD to EUR conversion
const usdToEur = currencyService.convert(100, "USD", "EUR");
console.log("$100 USD to EUR:", currencyService.formatAmount(usdToEur, "EUR"));

// Test EUR to GBP conversion
const eurToGbp = currencyService.convert(100, "EUR", "GBP");
console.log("€100 EUR to GBP:", currencyService.formatAmount(eurToGbp, "GBP"));

// Test base currency functionality
currencyService.setBaseCurrency("EUR");
console.log("Base currency set to:", currencyService.getBaseCurrency());

const convertedToBase = currencyService.convertToBase(100, "USD");
console.log(
  "$100 USD to base currency (EUR):",
  currencyService.formatAmount(convertedToBase, "EUR"),
);

// Test formatting
console.log(
  "Format $1234.56 USD:",
  currencyService.formatAmount(1234.56, "USD"),
);
console.log(
  "Format ¥1234.56 JPY:",
  currencyService.formatAmount(1234.56, "JPY"),
);
console.log(
  "Format 1234.56 SEK:",
  currencyService.formatAmount(1234.56, "SEK"),
);

export {}; // Make this a module
