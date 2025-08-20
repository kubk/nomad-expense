import { useCurrency } from "@/shared/currency-context";
import { currencyService } from "@/shared/currency-service";
import { MonthlyData } from "@/shared/types";

export function OverviewHeader({
  convertedMonthlyData,
}: {
  convertedMonthlyData: (MonthlyData & { convertedAmount: number })[];
}) {
  const { baseCurrency } = useCurrency();
  return (
    <div className="bg-primary text-primary-foreground px-4 py-6 pb-18">
      {/* Total This Month */}
      <div className="bg-background/10 backdrop-blur rounded-2xl p-4">
        <p className="text-primary-foreground/70 text-sm mb-1">
          Total this month
        </p>
        <p className="text-3xl font-bold">
          {(() => {
            const currentDate = new Date();
            const currentMonth = currentDate.toLocaleDateString("en-US", {
              month: "short",
            });
            const currentYear = currentDate.getFullYear();
            const currentMonthKey = `${currentMonth} ${currentYear}`;
            const monthData = convertedMonthlyData.find(
              (m) => m.month === currentMonthKey,
            );
            return currencyService.formatAmount(
              monthData?.convertedAmount || 0,
              baseCurrency,
            );
          })()}
        </p>
      </div>
    </div>
  );
}
