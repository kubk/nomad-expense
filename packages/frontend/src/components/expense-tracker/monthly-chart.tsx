import { useEffect, useRef } from "react";
import { MonthlyData, DateRange } from "./types";
import { useCurrency } from "./currency-context";
import { currencyService } from "./currency-service";

export function MonthlyChart({
  monthlyData,
  setCurrentScreen,
  setDateRange,
  setSelectedAccount,
}: {
  monthlyData: MonthlyData[];
  setCurrentScreen: (screen: string) => void;
  setDateRange: (range: DateRange) => void;
  setSelectedAccount: (account: string) => void;
}) {
  const { baseCurrency } = useCurrency();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Convert monthly data amounts to base currency
  const convertedMonthlyData = monthlyData.map((month) => ({
    ...month,
    convertedAmount: currencyService.convert(month.amount, "USD", baseCurrency),
  }));

  // Sort months chronologically with current month on the right
  const sortedMonthlyData = [...convertedMonthlyData].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
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
    return monthNames.indexOf(a.shortMonth) - monthNames.indexOf(b.shortMonth);
  });

  const maxAmount = Math.max(
    ...sortedMonthlyData.map((m) => m.convertedAmount),
  );

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

    setDateRange({ from: startDate, to: endDate });
    setSelectedAccount("all");
    setCurrentScreen("transactions");
  };

  return (
    <div
      ref={scrollContainerRef}
      className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
    >
      <div className="flex items-end gap-3 pb-4 min-w-max">
        {sortedMonthlyData.map((month) => {
          const heightPercentage = (month.convertedAmount / maxAmount) * 100;
          const barHeight = (heightPercentage / 100) * 100; // 100px max height

          return (
            <div
              key={month.month}
              className="flex flex-col items-center min-w-[64px]"
            >
              {/* Amount label above bar */}
              <div className="mb-4 text-xs font-semibold text-gray-900 text-center">
                {currencyService.formatAmount(
                  month.convertedAmount,
                  baseCurrency,
                )}
              </div>

              {/* Chart container */}
              <button
                onClick={() => handleMonthClick(month)}
                className="relative flex items-end cursor-pointer hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors group"
                style={{ height: "100px" }}
              >
                {/* Violet bar - only visible part */}
                <div
                  className="w-10 bg-indigo-500 rounded-t-lg transition-all duration-300 group-hover:bg-indigo-600"
                  style={{
                    height: `${barHeight}px`,
                  }}
                />
              </button>

              {/* Month name below bar - clickable */}
              <button
                onClick={() => handleMonthClick(month)}
                className="mt-2 text-xs font-medium text-gray-900 hover:text-indigo-600 hover:underline transition-colors cursor-pointer"
              >
                {month.shortMonth}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
