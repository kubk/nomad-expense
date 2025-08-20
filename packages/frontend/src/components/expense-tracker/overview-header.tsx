import { MonthlyData } from "./types";
import { currencyService } from "./currency-service";

export function OverviewHeader({
  convertedMonthlyData,
  baseCurrency,
}: {
  convertedMonthlyData: (MonthlyData & { convertedAmount: number })[];
  baseCurrency: string;
}) {
  return (
    <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white px-4 py-6 pb-18">
      {/* Total This Month */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
        <p className="text-indigo-100 text-sm mb-1">Total this month</p>
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
