import { FilterIcon, CalendarIcon, Building2Icon } from "lucide-react";
import { currencyStore } from "../../store/currency-store";
import { formatAmount } from "../../shared/currency-converter";
import { MonthlyBreakdownFilters, MonthlyBreakdownFull } from "api";

export function YearSummaryCard({
  convertedMonthlyData,
  onFiltersClick,
  appliedFilters,
}: {
  convertedMonthlyData: MonthlyBreakdownFull["data"];
  onFiltersClick: () => void;
  appliedFilters: MonthlyBreakdownFilters;
}) {
  const totalAmount = convertedMonthlyData.reduce(
    (sum, m) => sum + m.convertedAmount,
    0,
  );

  const hardcodedIncome = 130000; // $1,300 hardcoded as requested

  return (
    <div className="px-4 mt-4">
      <button
        className="w-full bg-card border shadow-xs rounded-xl hover:bg-muted/50"
        onClick={onFiltersClick}
      >
        <div className="p-4 rounded-md">
          {/* Pills and Filter Button Row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex gap-2">
              <div className="bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                <CalendarIcon className="w-3 h-3" />
                {appliedFilters.date.type === "months"
                  ? appliedFilters.date.value === 1
                    ? "Last month"
                    : appliedFilters.date.value === 12
                      ? "Last year"
                      : `Last ${appliedFilters.date.value} months`
                  : appliedFilters.date.type === "years"
                    ? `${appliedFilters.date.value.length} year${appliedFilters.date.value.length > 1 ? "s" : ""}`
                    : "All time"}
              </div>
              <div className="bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                <Building2Icon className="w-3 h-3" />
                {appliedFilters.accounts.length > 0
                  ? `${appliedFilters.accounts.length} account${appliedFilters.accounts.length > 1 ? "s" : ""}`
                  : "All accounts"}
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
              <div className="text-2xl font-bold text-foreground">
                {formatAmount(totalAmount, currencyStore.baseCurrency, {
                  showFractions: false,
                })}
              </div>
            </div>

            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-muted-foreground">
                  Income
                </span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                +
                {formatAmount(hardcodedIncome, currencyStore.baseCurrency, {
                  showFractions: false,
                })}
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
