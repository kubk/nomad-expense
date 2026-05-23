import {
  FilterIcon,
  CalendarIcon,
  WalletIcon,
  CircleDollarSignIcon,
} from "lucide-react";
import { formatAmount } from "../../shared/currency-formatter";
import { type TransactionFilters } from "api";
import { Skeleton } from "@/components/ui/skeleton";
import { getShortMonthName } from "../../shared/date-utils";
import { useBaseCurrency } from "@/shared/hooks/use-base-currency";
import { haptic } from "@/shared/platform/haptics";
import { useTranslation } from "@/translations/translation-provider";

export function SummaryCard({
  onFiltersClick,
  appliedFilters,
  totalAmount,
  totalIncome,
  isLoading,
}: {
  onFiltersClick: () => void;
  appliedFilters: TransactionFilters;
  totalAmount: number;
  totalIncome: number;
  isLoading: boolean;
}) {
  const baseCurrency = useBaseCurrency();
  const { t } = useTranslation();

  const getAccountsLabel = () => {
    return t("filtersAccountCount", appliedFilters.accounts.length);
  };

  const getDateLabel = () => {
    if (appliedFilters.date.type === "months") {
      return t("filtersLastMonths", appliedFilters.date.value);
    }
    if (appliedFilters.date.type === "custom") {
      const months = appliedFilters.date.value;
      if (months.length === 1) {
        return `${months[0].year} ${getShortMonthName(months[0].month)}`;
      }
      const years = [...new Set(months.map((m) => m.year))];
      if (years.length === 1) {
        return t("filtersYearMonths", years[0], months.length);
      }
      return t("filtersCustomMonths", months.length);
    }
    return t("filtersAllTime");
  };

  return (
    <button
      className="w-full bg-card shadow-sm rounded-xl active:scale-95 transition-transform"
      onClick={() => {
        haptic("light");
        onFiltersClick();
      }}
    >
      <div className="p-4 rounded-md">
        {/* Pills and Filter Button Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-wrap gap-2">
            <div className="bg-muted whitespace-nowrap text-muted-foreground px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
              <CalendarIcon className="w-3 h-3" />
              {getDateLabel()}
            </div>
            <div className="bg-muted whitespace-nowrap text-muted-foreground px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
              <WalletIcon className="w-3 h-3" />
              {getAccountsLabel()}
            </div>
            {appliedFilters.transactionType && (
              <div className="bg-muted whitespace-nowrap text-muted-foreground px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                <CircleDollarSignIcon className="w-3 h-3" />
                {appliedFilters.transactionType === "expense"
                  ? t("transactionTypeExpense")
                  : t("transactionTypeIncome")}
              </div>
            )}
            {appliedFilters.description && (
              <div className="bg-muted whitespace-nowrap text-muted-foreground px-3 py-1.5 rounded-full text-xs font-medium">
                {appliedFilters.description.type === "exact"
                  ? t(
                      "filtersDescriptionExact",
                      appliedFilters.description.input,
                    )
                  : t(
                      "filtersDescriptionContains",
                      appliedFilters.description.input,
                    )}
              </div>
            )}
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
                {t("summaryExpenses")}
              </span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-22" />
            ) : (
              <div className="text-2xl font-bold text-foreground font-mono">
                {formatAmount(totalAmount, baseCurrency, {
                  showFractions: false,
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
              <span className="text-xs font-medium text-muted-foreground">
                {t("summaryIncome")}
              </span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-22" />
            ) : (
              <div className="text-2xl flex items-center gap-1 font-bold text-green-600 dark:text-green-400 font-mono">
                <span>+</span>
                <span>
                  {formatAmount(totalIncome, baseCurrency, {
                    showFractions: false,
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
