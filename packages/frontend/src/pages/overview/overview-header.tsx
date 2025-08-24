import { formatAmount } from "@/shared/currency-formatter";
import { api } from "../../api";

export function OverviewHeader() {
  const { data: overviewData, isLoading } = api.expenses.overview.useQuery();
  const sortedMonthlyData = overviewData?.overview.data || [];

  return (
    <div className="bg-primary text-primary-foreground dark:bg-muted px-4 py-6 pb-18">
      <div className="bg-background/10 dark:bg-background/50 backdrop-blur rounded-2xl p-4">
        <p className="text-primary-foreground/70 dark:text-foreground/70 text-sm mb-1">
          Total this month
        </p>
        <div className="text-3xl dark:text-foreground font-bold">
          {isLoading ? (
            <div className="animate-pulse bg-muted h-9 w-32 rounded"></div>
          ) : (
            formatAmount(sortedMonthlyData[0]?.amount || 0, "USD")
          )}
        </div>
      </div>
    </div>
  );
}
