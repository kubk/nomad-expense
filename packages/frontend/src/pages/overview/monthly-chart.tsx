import { useEffect, useRef } from "react";
import { formatAmount } from "../../shared/currency-converter";
import { api } from "../../api";

export function MonthlyChart() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: overviewData, isLoading } = api.expenses.overview.useQuery();

  const sortedMonthlyData = overviewData?.data || [];
  const maxAmount = overviewData?.maxAmount || 0;

  // Scroll to the right on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft =
        scrollContainerRef.current.scrollWidth;
    }
  }, [sortedMonthlyData]);

  if (isLoading) {
    return (
      <div className="flex items-end pb-4 min-w-max">
        <div className="animate-pulse bg-muted h-20 w-10 rounded-t-lg"></div>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
    >
      <div className="flex items-end pb-4 min-w-max">
        {sortedMonthlyData.map((month) => {
          const heightPercentage = (month.convertedAmount / maxAmount) * 100;
          const barHeight = (heightPercentage / 100) * 100; // 100px max height

          return (
            <div
              key={month.month}
              className="flex flex-col cursor-pointer items-center min-w-[64px] active:scale-95 transition-transform duration-150"
            >
              <div className="mb-4 text-xs font-semibold text-foreground text-center">
                {formatAmount(month.convertedAmount, month.currency as any, {
                  showFractions: false,
                })}
              </div>

              {/* Chart container */}
              <div
                className="relative flex items-end cursor-pointer hover:bg-muted/50 rounded-lg p-1 -m-1 transition-colors group"
                style={{ height: "100px" }}
              >
                <div
                  className="w-10 bg-primary rounded-t-lg transition-all duration-300 group-hover:bg-primary/90"
                  style={{
                    height: `${barHeight}px`,
                  }}
                />
              </div>

              <div className="mt-2 text-xs font-medium text-foreground hover:text-primary hover:underline transition-colors cursor-pointer">
                {month.shortMonth}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
