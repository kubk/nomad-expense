import { useState } from "react";
import { useSearch } from "wouter";
import { safeParseQuery } from "typesafe-routes";
import { Card, CardContent } from "@/components/ui/card";
import { currencyStore } from "../../store/currency-store";
import { convert } from "../../shared/currency-converter";
import { MonthlyBreakdownItem } from "./monthly-breakdown-item";
import { YearSummaryCard } from "./year-summary-card";
import { FiltersDrawer } from "./filters-drawer";
import { PageHeader } from "../shared/page-header";
import { expenseStore } from "@/store/expense-store";
import { routes } from "../../routes";

export function MonthlyBreakdownFull() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const parsedQuery = safeParseQuery(routes.monthlyBreakdownFull, useSearch());

  const appliedFilters = {
    years:
      parsedQuery.success && parsedQuery.data.years
        ? parsedQuery.data.years.split(",").map(Number)
        : [],
    accounts:
      parsedQuery.success && parsedQuery.data.accounts
        ? parsedQuery.data.accounts.split(",")
        : expenseStore.accounts.map((a) => a.id),
    months: parsedQuery.success ? parsedQuery.data.months || 0 : 3,
  };

  // Convert monthly data amounts to base currency and sort by newest first
  const convertedMonthlyData = expenseStore.monthlyData
    .map((month) => ({
      ...month,
      convertedAmount: convert(month.amount, "USD", currencyStore.baseCurrency),
    }))
    .sort((a, b) => {
      // Sort by year first (descending), then by month (descending)
      if (a.year !== b.year) {
        return b.year - a.year;
      }
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
      const aMonthIndex = monthNames.indexOf(a.shortMonth);
      const bMonthIndex = monthNames.indexOf(b.shortMonth);
      return bMonthIndex - aMonthIndex;
    });

  // Calculate filtered monthly data based on transaction-level filtering
  const getFilteredMonthlyData = () => {
    // If no filters applied, return all data
    if (
      appliedFilters.years.length === 0 &&
      appliedFilters.accounts.length === 0 &&
      appliedFilters.months === 0
    ) {
      return convertedMonthlyData;
    }

    // Filter transactions first
    const filteredTransactions = expenseStore.transactions.filter(
      (transaction) => {
        const transactionDate = new Date(transaction.date);
        const transactionYear = transactionDate.getFullYear();
        const transactionMonth = transactionDate.getMonth();
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Account filter
        const accountMatch =
          appliedFilters.accounts.length === 0 ||
          appliedFilters.accounts.includes(transaction.account);

        // Time filter
        let timeMatch = true;
        if (appliedFilters.months > 0) {
          // Calculate months ago
          const monthsAgo =
            (currentYear - transactionYear) * 12 +
            (currentMonth - transactionMonth);
          timeMatch = monthsAgo < appliedFilters.months;
        } else if (appliedFilters.years.length > 0) {
          timeMatch = appliedFilters.years.includes(transactionYear);
        }

        return accountMatch && timeMatch && transaction.usd < 0; // Only expenses
      },
    );

    // Recalculate monthly data from filtered transactions
    const monthlyTotals: {
      [key: string]: { amount: number; year: number; shortMonth: string };
    } = {};

    filteredTransactions.forEach((transaction) => {
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

      monthlyTotals[monthKey].amount += Math.abs(transaction.usd);
    });

    const filteredMonthlyData = Object.keys(monthlyTotals)
      .map((monthKey) => ({
        month: monthKey,
        shortMonth: monthlyTotals[monthKey].shortMonth,
        amount: Math.round(monthlyTotals[monthKey].amount),
        year: monthlyTotals[monthKey].year,
        convertedAmount: convert(
          Math.round(monthlyTotals[monthKey].amount),
          "USD",
          currencyStore.baseCurrency,
        ),
      }))
      .sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year;
        }
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
        const aMonthIndex = monthNames.indexOf(a.shortMonth);
        const bMonthIndex = monthNames.indexOf(b.shortMonth);
        return bMonthIndex - aMonthIndex;
      });

    return filteredMonthlyData;
  };

  const filteredMonthlyData = getFilteredMonthlyData();

  const maxAmount = Math.max(
    ...filteredMonthlyData.map((m) => m.convertedAmount),
  );

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title="Monthly breakdown" />

      <YearSummaryCard
        convertedMonthlyData={filteredMonthlyData}
        onFiltersClick={() => setIsDrawerOpen(true)}
        appliedFilters={appliedFilters}
      />

      {/* All Months - Transaction Style List */}
      <div className="px-4 mt-4">
        <Card className="shadow border-0 p-0">
          <CardContent className="p-0">
            {filteredMonthlyData.map((month, index) => (
              <MonthlyBreakdownItem
                key={month.month}
                month={month}
                index={index}
                totalItems={filteredMonthlyData.length}
                maxAmount={maxAmount}
                setDateRange={expenseStore.setDateRange}
                setSelectedAccount={expenseStore.setSelectedAccount}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Filters Drawer */}
      <FiltersDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        monthlyData={expenseStore.monthlyData}
        appliedFilters={appliedFilters}
      />
    </div>
  );
}
