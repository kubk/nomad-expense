import { currencyService, SupportedCurrency } from "./currency-service";
import { DateRange, Transaction } from "./types";

export const filterTransactions = (
  transactions: Transaction[],
  selectedAccount: string,
  dateRange: DateRange,
): Transaction[] => {
  return transactions.filter((transaction) => {
    // Filter by account
    const accountMatch =
      selectedAccount === "all" || transaction.account === selectedAccount;

    // Filter by date range if set
    let dateMatch = true;
    if (dateRange.from || dateRange.to) {
      const transactionDate = new Date(transaction.date);

      if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        dateMatch = dateMatch && transactionDate >= fromDate;
      }

      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999); // Include full end date
        dateMatch = dateMatch && transactionDate <= toDate;
      }
    }

    return accountMatch && dateMatch;
  });
};

export const calculateTotal = (
  transactions: Transaction[],
  baseCurrency?: SupportedCurrency,
): number => {
  const targetCurrency = baseCurrency || currencyService.getBaseCurrency();

  return transactions.reduce((sum, t) => {
    // Only include expenses (negative amounts) in the total
    if (t.usd >= 0) return sum; // Skip income transactions

    // Convert from USD (stored in t.usd as cents) to the target currency
    const convertedAmountInCents = currencyService.convert(
      Math.abs(t.usd),
      "USD",
      targetCurrency,
    );
    return sum + convertedAmountInCents;
  }, 0);
};

export const formatDisplayDate = (dateString: string): string => {
  const transactionDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  // Reset time components for accurate comparison
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  transactionDate.setHours(0, 0, 0, 0);

  if (transactionDate.getTime() === today.getTime()) {
    return "Today";
  } else if (transactionDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  } else {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
};
