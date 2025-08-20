import { useState } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonthlyData, DateRange, Route } from "../../shared/types";
import { useCurrency } from "../../shared/currency-context";
import { currencyService } from "../../shared/currency-service";
import { MonthlyBreakdownItem } from "./monthly-breakdown-item";
import { YearSummaryCard } from "./year-summary-card";
import { FiltersDrawer } from "./filters-drawer";
import { accounts, transactions } from "../../shared/data";

export function MonthlyBreakdownFull({
  monthlyData,
  setCurrentScreen,
  setDateRange,
  setSelectedAccount,
}: {
  monthlyData: MonthlyData[];
  setCurrentScreen: (screen: Route) => void;
  setDateRange: (range: DateRange) => void;
  setSelectedAccount: (account: string) => void;
}) {
  const { baseCurrency } = useCurrency();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<{
    years: number[];
    accounts: string[];
    months: number;
  }>({
    years: [],
    accounts: [], // Empty means "all accounts"
    months: 0, // 0 means "all time"
  });

  // Convert monthly data amounts to base currency and sort by newest first
  const convertedMonthlyData = monthlyData
    .map((month) => ({
      ...month,
      convertedAmount: currencyService.convert(
        month.amount,
        "USD",
        baseCurrency,
      ),
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
    const filteredTransactions = transactions.filter((transaction) => {
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
    });

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
        convertedAmount: currencyService.convert(
          Math.round(monthlyTotals[monthKey].amount),
          "USD",
          baseCurrency,
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentScreen("overview")}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
          </Button>
          <h1 className="font-semibold text-gray-900">Monthly breakdown</h1>
          <div className="w-[60px]" />
        </div>
      </div>

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
                setDateRange={setDateRange}
                setSelectedAccount={setSelectedAccount}
                setCurrentScreen={setCurrentScreen}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Filters Drawer */}
      <FiltersDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        monthlyData={monthlyData}
        accounts={accounts}
        appliedFilters={appliedFilters}
        onApplyFilters={setAppliedFilters}
      />
    </div>
  );
}
