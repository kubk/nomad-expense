import { formatAmount } from "@/shared/currency-converter";
import { currencyStore } from "@/store/currency-store";
import { expenseStore } from "@/store/expense-store";
import { convert } from "@/shared/currency-converter";

export function OverviewHeader() {
  // Convert monthly data amounts to base currency
  const convertedMonthlyData = expenseStore.monthlyData.map((month) => ({
    ...month,
    convertedAmount: convert(month.amount, "USD", currencyStore.baseCurrency),
  }));
  return (
    <div className="bg-primary text-primary-foreground dark:bg-muted px-4 py-6 pb-18">
      <div className="bg-background/10 dark:bg-background/50 backdrop-blur rounded-2xl p-4">
        <p className="text-primary-foreground/70 dark:text-foreground/70 text-sm mb-1">
          Total this month
        </p>
        <p className="text-3xl dark:text-foreground font-bold">
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
            return formatAmount(
              monthData?.convertedAmount || 0,
              currencyStore.baseCurrency,
            );
          })()}
        </p>
      </div>
    </div>
  );
}
