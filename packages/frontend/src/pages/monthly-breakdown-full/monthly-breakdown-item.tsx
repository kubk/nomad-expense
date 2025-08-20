import { useLocation } from "wouter";
import { MonthlyData, DateRange } from "../../shared/types";
import { useCurrency } from "../../shared/currency-context";
import { currencyService } from "../../shared/currency-service";

export function MonthlyBreakdownItem({
  month,
  index,
  totalItems,
  maxAmount,
  setDateRange,
  setSelectedAccount,
}: {
  month: MonthlyData & { convertedAmount: number };
  index: number;
  totalItems: number;
  maxAmount: number;
  setDateRange: (range: DateRange) => void;
  setSelectedAccount: (account: string) => void;
}) {
  const { baseCurrency } = useCurrency();
  const [, setLocation] = useLocation();

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

  const widthPercentage = (month.convertedAmount / maxAmount) * 100;
  const barWidth = Math.max(widthPercentage, 2); // Minimum 2% width

  return (
    <div key={month.month}>
      <div
        className="cursor-pointer hover:bg-muted/50 transition-colors p-4"
        onClick={() => {
          setDateRange({ from: startDate, to: endDate });
          setSelectedAccount("all");
          setLocation("/transactions");
        }}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-medium text-foreground">
              {month.shortMonth} {month.year}
            </div>
            <div className="font-semibold text-foreground">
              {currencyService.formatAmount(
                month.convertedAmount,
                baseCurrency,
              )}
            </div>
          </div>

          {/* Horizontal chart bar */}
          <div className="relative h-2 bg-muted/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{
                width: `${barWidth}%`,
              }}
            />
          </div>
        </div>
      </div>
      {index < totalItems - 1 && <div className="border-b border-border" />}
    </div>
  );
}
