import { Card, CardContent } from "@/components/ui/card";
import { FilterIcon } from "lucide-react";
import { MonthlyData } from "../../shared/types";
import { useCurrency } from "../../shared/currency-context";
import { currencyService } from "../../shared/currency-service";

export function YearSummaryCard({
  convertedMonthlyData,
  onFiltersClick,
  appliedFilters,
}: {
  convertedMonthlyData: (MonthlyData & { convertedAmount: number })[];
  onFiltersClick: () => void;
  appliedFilters: { years: number[]; accounts: string[]; months: number };
}) {
  const { baseCurrency } = useCurrency();

  const totalAmount = convertedMonthlyData.reduce(
    (sum, m) => sum + m.convertedAmount,
    0,
  );

  const getFilterDescription = () => {
    const parts = [];

    // Time period description
    if (appliedFilters.months > 0) {
      if (appliedFilters.months === 1) {
        parts.push("last month");
      } else if (appliedFilters.months === 12) {
        parts.push("last year");
      } else {
        parts.push(`last ${appliedFilters.months} months`);
      }
    } else if (appliedFilters.years.length > 0) {
      parts.push(
        `${appliedFilters.years.length} year${appliedFilters.years.length > 1 ? "s" : ""}`,
      );
    } else {
      parts.push("all time");
    }

    // Account description
    if (appliedFilters.accounts.length > 0) {
      parts.push(
        `${appliedFilters.accounts.length} account${appliedFilters.accounts.length > 1 ? "s" : ""}`,
      );
    } else {
      parts.push("all accounts");
    }

    return parts.join(", ");
  };

  return (
    <div className="px-4 mt-4">
      <Card
        className="bg-gradient-to-r py-4 pt-2.5 from-indigo-500 to-purple-500 text-white border-0 cursor-pointer hover:from-indigo-600 hover:to-purple-600 transition-colors"
        onClick={onFiltersClick}
      >
        <CardContent className="px-4 relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-2xl font-bold mt-1">
                {currencyService.formatAmount(totalAmount, baseCurrency)}
              </p>
              <p className="text-indigo-100 text-xs mt-2">
                {getFilterDescription()}
              </p>
            </div>
            <FilterIcon className="w-5 h-5 mt-1" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
