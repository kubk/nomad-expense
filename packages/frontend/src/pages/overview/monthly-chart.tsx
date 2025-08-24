import { useEffect, useRef } from "react";
import { formatAmount } from "../../shared/currency-formatter";
import { api } from "../../api";
import { cn } from "@/lib/utils";

export function MonthlyChart() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: overviewData, isLoading } = api.expenses.overview.useQuery();

  const sortedMonthlyData = overviewData?.overview.data || [];
  const maxAmount = overviewData?.overview.maxAmount || 0;

  // Scroll to the right on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft =
        scrollContainerRef.current.scrollWidth;
    }
  }, [sortedMonthlyData]);

  return (
    <div
      ref={scrollContainerRef}
      className={cn(
        !isLoading &&
          "overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
      )}
    >
      <div className="flex items-end pb-4 min-w-max">
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col cursor-pointer items-center pb-2 min-w-[64px]"
              >
                <div className="mb-4 text-xs font-semibold text-foreground text-center">
                  <div className="animate-pulse bg-muted h-3 w-12 rounded"></div>
                </div>

                {/* Chart container */}
                <div className="relative h-[100px] flex items-end cursor-pointer rounded-lg p-1 -m-1">
                  <div className="w-10 bg-muted animate-pulse rounded-t-lg h-20" />
                </div>

                <div className="mt-2 text-xs font-medium text-foreground cursor-pointer">
                  <div className="animate-pulse bg-muted h-3 w-8 rounded"></div>
                </div>
              </div>
            ))
          : sortedMonthlyData.map((month) => {
              const heightPercentage = (month.amount / maxAmount) * 100;
              const barHeight = (heightPercentage / 100) * 100; // 100px max height

              return (
                <div
                  key={month.month}
                  className="flex flex-col cursor-pointer items-center min-w-[64px]"
                >
                  <div className="mb-4 text-xs font-semibold text-foreground text-center">
                    {formatAmount(month.amount, "USD", {
                      showFractions: false,
                    })}
                  </div>

                  {/* Chart container */}
                  <div className="relative h-[100px] flex items-end cursor-pointer rounded-lg p-1 -m-1">
                    <div
                      className="w-10 bg-primary rounded-t-lg transition-all duration-300"
                      style={{
                        height: `${barHeight}px`,
                      }}
                    />
                  </div>

                  <div className="mt-2 text-xs font-medium text-foreground cursor-pointer">
                    {month.shortMonth}
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
