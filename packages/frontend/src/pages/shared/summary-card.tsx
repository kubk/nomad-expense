import { FilterIcon, CalendarIcon, WalletIcon } from "lucide-react";
import { formatAmount } from "../../shared/currency-converter";
import { TransactionFilters } from "api";
import { Skeleton } from "@/components/ui/skeleton";
import { getShortMonthName } from "../../shared/date-utils";

export function SummaryCard({
  onFiltersClick,
  appliedFilters,
  totalAmount,
  isLoading,
}: {
  onFiltersClick: () => void;
  appliedFilters: TransactionFilters;
  totalAmount: number;
  isLoading: boolean;
}) {
  const hardcodedIncome = 130000; // $1,300 hardcoded as requested

  const getAccountsLabel = () => {
    return `${appliedFilters.accounts.length} account${appliedFilters.accounts.length > 1 ? "s" : ""}`;
  };

  const getDateLabel = () => {
    if (appliedFilters.date.type === "months") {
      if (appliedFilters.date.value === 1) return "Last month";
      if (appliedFilters.date.value === 12) return "Last year";
      return `Last ${appliedFilters.date.value} months`;
    }
    if (appliedFilters.date.type === "custom") {
      const months = appliedFilters.date.value;
      if (months.length === 1) {
        return `${months[0].year} ${getShortMonthName(months[0].month)}`;
      }
      const years = [...new Set(months.map((m) => m.year))];
      if (years.length === 1) {
        return `${years[0]} (${months.length} months)`;
      }
      return `Custom (${months.length} months)`;
    }
    return "All time";
  };

  return (
    <div className="px-4 mt-4">
      <button
        className="w-full bg-card border shadow-xs rounded-xl"
        onClick={onFiltersClick}
      >
        <div className="p-4 rounded-md">
          {/* Pills and Filter Button Row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex gap-2">
              <div className="bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                <CalendarIcon className="w-3 h-3" />
                {getDateLabel()}
              </div>
              <div className="bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                <WalletIcon className="w-3 h-3" />
                {getAccountsLabel()}
              </div>
            </div>
            <div className="p-2">
              <FilterIcon className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Expense and Income Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-destructive rounded-full"></div>
                <span className="text-xs font-medium text-muted-foreground">
                  Expenses
                </span>
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-22" />
              ) : (
                <div className="text-2xl font-bold text-foreground">
                  {formatAmount(totalAmount, "USD", {
                    showFractions: false,
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                <span className="text-xs font-medium text-muted-foreground">
                  Income
                </span>
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-22" />
              ) : (
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  +
                  {formatAmount(hardcodedIncome, "USD", {
                    showFractions: false,
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
