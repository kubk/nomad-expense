import { useEffect, useRef } from "react";
import { formatAmount } from "../../shared/currency-formatter";
import { cn } from "@/lib/utils";
import { MonthlyChartEmptyState } from "./monthly-chart-empty-state";
import { MonthlyChartLoader } from "./monthly-chart-loader";
import { useRouter } from "@/shared/stacked-router/router";
import { calculateMaxAmount } from "../../shared/chart-calculations";
import { useBaseCurrency } from "@/shared/hooks/use-base-currency";
import { haptic } from "@/shared/platform/haptics";
import { getShortMonthName } from "@/shared/date-utils";
import { useAccountIds } from "@/shared/hooks/use-account-ids";
import { LoaderCircleIcon } from "lucide-react";
import type { RouterOutputs } from "api";

type OverviewData = RouterOutputs["expenses"]["overview"];

export function MonthlyChart({
  overviewPages,
  isLoading,
  isFetchingPreviousPage,
  hasPreviousPage,
  fetchPreviousPage,
}: {
  overviewPages: OverviewData[];
  isLoading: boolean;
  isFetchingPreviousPage: boolean;
  hasPreviousPage: boolean;
  fetchPreviousPage: () => Promise<unknown>;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const didScrollToLatestRef = useRef(false);
  const previousScrollWidthRef = useRef<number | undefined>(undefined);
  const previousScrollLeftRef = useRef(0);
  const { navigate } = useRouter();
  const accountIds = useAccountIds();
  const baseCurrency = useBaseCurrency();

  const sortedMonthlyData = overviewPages.flatMap((page) => page.overview.data);
  const maxAmount = calculateMaxAmount(sortedMonthlyData);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    if (isLoading || !scrollContainer || sortedMonthlyData.length === 0) {
      return;
    }

    if (!didScrollToLatestRef.current) {
      scrollContainer.scrollLeft = scrollContainer.scrollWidth;
      didScrollToLatestRef.current = true;
      return;
    }

    if (previousScrollWidthRef.current !== undefined) {
      scrollContainer.scrollLeft =
        scrollContainer.scrollWidth -
        previousScrollWidthRef.current +
        previousScrollLeftRef.current;
      previousScrollWidthRef.current = undefined;
    }
  }, [isLoading, sortedMonthlyData.length]);

  const handleScroll = () => {
    const scrollContainer = scrollContainerRef.current;

    if (
      !scrollContainer ||
      scrollContainer.scrollLeft > 24 ||
      !hasPreviousPage ||
      isFetchingPreviousPage
    ) {
      return;
    }

    previousScrollWidthRef.current = scrollContainer.scrollWidth;
    previousScrollLeftRef.current = scrollContainer.scrollLeft;
    fetchPreviousPage().catch(() => {
      previousScrollWidthRef.current = undefined;
    });
  };

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
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
              {isFetchingPreviousPage ? (
                <div className="flex h-[153px] min-w-8 items-center justify-center pr-2">
                  <LoaderCircleIcon className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : null}
              {sortedMonthlyData.map((month) => {
                const heightPercentage = (month.usdAmount / maxAmount) * 100;
                const barHeight = (heightPercentage / 100) * 100; // 100px max height

                return (
                  <div
                    key={month.month}
                    className="flex flex-col cursor-pointer items-center min-w-[64px]"
                    onClick={() => {
                      haptic("selection");
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
                      {formatAmount(month.usdAmount, baseCurrency, {
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
                      {getShortMonthName(month.monthNumber)}
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
