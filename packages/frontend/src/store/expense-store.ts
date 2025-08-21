import { makeAutoObservable } from "mobx";
import { Account, MonthlyData, Transaction, DateRange } from "@/shared/types";
import { convert } from "@/shared/currency-converter";
import { currencyStore } from "./currency-store";
import {
  accounts as mockAccounts,
  transactions as mockTransactions,
} from "@/shared/data";

export class ExpenseStore {
  // Observable data from data.ts
  accounts: Account[] = mockAccounts;

  // Observable filters
  selectedAccount = "all";
  dateRange: DateRange = { from: "", to: "" };

  // Raw transactions - imported from data.ts
  private rawTransactions: Transaction[] = mockTransactions;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // Actions to update filters
  setSelectedAccount(accountId: string) {
    this.selectedAccount = accountId;
  }

  setDateRange(range: DateRange) {
    this.dateRange = range;
  }

  // Computed: filtered transactions based on current filters
  get filteredTransactions(): Transaction[] {
    return this.rawTransactions.filter((transaction) => {
      // Filter by account
      const accountMatch =
        this.selectedAccount === "all" ||
        transaction.account === this.selectedAccount;

      // Filter by date range if set
      let dateMatch = true;
      if (this.dateRange.from || this.dateRange.to) {
        const transactionDate = new Date(transaction.date);

        if (this.dateRange.from) {
          const fromDate = new Date(this.dateRange.from);
          dateMatch = dateMatch && transactionDate >= fromDate;
        }

        if (this.dateRange.to) {
          const toDate = new Date(this.dateRange.to);
          toDate.setHours(23, 59, 59, 999); // Include full end date
          dateMatch = dateMatch && transactionDate <= toDate;
        }
      }

      return accountMatch && dateMatch;
    });
  }

  // Computed: all transactions (for components that don't need filtering)
  get transactions(): Transaction[] {
    return this.rawTransactions;
  }

  // Computed: total of filtered transactions in base currency
  get totalInBaseCurrency(): number {
    const targetCurrency = currencyStore.baseCurrency;

    return this.filteredTransactions.reduce((sum, t) => {
      // Only include expenses (negative amounts) in the total
      if (t.usd >= 0) return sum; // Skip income transactions

      // Convert from USD (stored in t.usd as cents) to the target currency
      const convertedAmountInCents = convert(
        Math.abs(t.usd),
        "USD",
        targetCurrency,
      );
      return sum + convertedAmountInCents;
    }, 0);
  }

  // Computed: monthly data grouped from transactions
  get monthlyData(): MonthlyData[] {
    const monthlyTotals: {
      [key: string]: { amount: number; year: number; shortMonth: string };
    } = {};

    this.rawTransactions.forEach((transaction) => {
      // Only include expenses (negative amounts) in monthly totals
      if (transaction.usd >= 0) return; // Skip income transactions

      const date = new Date(transaction.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const shortMonth = monthNames[month - 1];
      const monthKey = `${shortMonth} ${year}`;

      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = {
          amount: 0,
          year,
          shortMonth,
        };
      }

      // Add absolute value of expense (convert negative to positive)
      monthlyTotals[monthKey].amount += Math.abs(transaction.usd);
    });

    return Object.keys(monthlyTotals)
      .sort((a, b) => {
        const [monthA, yearA] = a.split(" ");
        const [monthB, yearB] = b.split(" ");
        const yearDiff = parseInt(yearA) - parseInt(yearB);
        if (yearDiff !== 0) return yearDiff;

        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return monthNames.indexOf(monthA) - monthNames.indexOf(monthB);
      })
      .map((monthKey) => ({
        month: monthKey,
        shortMonth: monthlyTotals[monthKey].shortMonth,
        amount: Math.round(monthlyTotals[monthKey].amount),
        year: monthlyTotals[monthKey].year,
      }));
  }

  // Computed: recent transactions (last 5 transactions, sorted by date desc)
  get recentTransactions(): Transaction[] {
    return this.rawTransactions
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  // Computed: transactions grouped by month for monthly breakdown
  get transactionsByMonth(): { [monthKey: string]: Transaction[] } {
    const grouped: { [monthKey: string]: Transaction[] } = {};

    this.rawTransactions.forEach((transaction) => {
      const monthKey = transaction.month;
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(transaction);
    });

    return grouped;
  }
}

export const expenseStore = new ExpenseStore();
