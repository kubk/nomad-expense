import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { currencyStore } from "../../store/currency-store";
import { formatAmount } from "../../shared/currency-converter";
import { expenseStore } from "@/store/expense-store";

export function MonthlyChart() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const { data: sortedMonthlyData, maxAmount } = expenseStore.monthlyChartData;

  // Scroll to the right on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft =
        scrollContainerRef.current.scrollWidth;
    }
  }, []);

  const handleMonthClick = (month: (typeof sortedMonthlyData)[0]) => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthNumber = monthNames.indexOf(month.shortMonth) + 1;
    const startDate = `${month.year}-${String(monthNumber).padStart(2, "0")}-01`;
    const endDate = new Date(month.year, monthNumber, 0)
      .toISOString()
      .split("T")[0];

    expenseStore.setDateRange({ from: startDate, to: endDate });
    expenseStore.setSelectedAccount("all");
    setLocation("/transactions");
  };

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
              onClick={() => handleMonthClick(month)}
            >
              <div className="mb-4 text-xs font-semibold text-foreground text-center">
                {formatAmount(
                  month.convertedAmount,
                  currencyStore.baseCurrency,
                  { showFractions: false },
                )}
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
