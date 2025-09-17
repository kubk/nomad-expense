import { useEffect, useRef } from "react";
import { formatAmount } from "../../shared/currency-formatter";
import { trpc } from "../../shared/api";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { MonthlyChartEmptyState } from "./monthly-chart-empty-state";
import { MonthlyChartLoader } from "./monthly-chart-loader";
import { useAccountIds } from "@/shared/hooks/use-account-ids";
import { useRouter } from "@/shared/stacked-router/router";
import { calculateMaxAmount } from "../../shared/chart-calculations";

export function MonthlyChart() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { navigate } = useRouter();
  const accountIds = useAccountIds();

  const { data: overviewData, isLoading } = useQuery(
    trpc.expenses.overview.queryOptions(),
  );

  const sortedMonthlyData = overviewData?.overview.data || [];
  const maxAmount = calculateMaxAmount(sortedMonthlyData);

  useEffect(() => {
    // Scroll to the right on mount
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
      <div className="flex items-end pb-4">
        {(() => {
          if (isLoading) {
            return <MonthlyChartLoader />;
          }

          if (sortedMonthlyData.length === 0) {
            return <MonthlyChartEmptyState />;
          }

          return (
            <div className="flex items-end pb-4 min-w-max">
              {sortedMonthlyData.map((month) => {
                const heightPercentage = (month.usdAmount / maxAmount) * 100;
                const barHeight = (heightPercentage / 100) * 100; // 100px max height

                return (
                  <div
                    key={month.month}
                    className="flex flex-col cursor-pointer items-center min-w-[64px]"
                    onClick={() => {
                      navigate({
                        type: "transactions",
                        filters: {
                          accounts: accountIds,
                          date: {
                            type: "custom",
                            value: [
                              { year: month.year, month: month.monthNumber },
                            ],
                          },
                          order: { field: "createdAt", direction: "desc" },
                        },
                      });
                    }}
                  >
                    <div className="mb-4 text-xs font-semibold text-foreground text-center font-mono">
                      {formatAmount(month.usdAmount, "USD", {
                        showFractions: false,
                      })}
                    </div>

                    {/* Chart container */}
                    <div className="relative h-[100px] flex items-end cursor-pointer rounded-lg p-1 -m-1">
                      <div
                        className="w-10 bg-primary rounded-t-lg transition-all duration-300 hover:scale-105"
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
          );
        })()}
      </div>
    </div>
  );
}
