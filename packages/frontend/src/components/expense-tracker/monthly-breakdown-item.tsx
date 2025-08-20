import { MonthlyData, DateRange } from "./types";
import { useCurrency } from "./currency-context";

export function MonthlyBreakdownItem({
  month,
  index,
  totalItems,
  setDateRange,
  setSelectedAccount,
  setCurrentScreen,
}: {
  month: MonthlyData & { convertedAmount: number };
  index: number;
  totalItems: number;
  setDateRange: (range: DateRange) => void;
  setSelectedAccount: (account: string) => void;
  setCurrentScreen: (screen: string) => void;
}) {
  const { baseCurrency, formatAmount } = useCurrency();

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

  return (
    <div key={month.month}>
      <div
        className="cursor-pointer hover:bg-gray-50 transition-colors p-4"
        onClick={() => {
          setDateRange({ from: startDate, to: endDate });
          setSelectedAccount("all");
          setCurrentScreen("transactions");
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900">
              {month.shortMonth} {month.year}
            </div>
            <div className="text-sm text-gray-500">Monthly expenses</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900">
              {formatAmount(month.convertedAmount, baseCurrency)}
            </div>
          </div>
        </div>
      </div>
      {index < totalItems - 1 && <div className="border-b border-gray-200" />}
    </div>
  );
}
