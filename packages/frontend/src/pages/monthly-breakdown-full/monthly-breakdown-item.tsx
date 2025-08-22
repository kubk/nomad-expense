import { useLocation } from "wouter";
import { render } from "typesafe-routes";
import { MonthlyData } from "api";
import { formatAmount } from "../../shared/currency-converter";
import { routes } from "../../routes";
import { useAccountIds } from "@/shared/hooks/use-account-ids";

export function MonthlyBreakdownItem({
  month,
  index,
  totalItems,
  maxAmount,
}: {
  month: MonthlyData;
  index: number;
  totalItems: number;
  maxAmount: number;
}) {
  const [, navigate] = useLocation();
  const accountIds = useAccountIds();

  const widthPercentage = (month.amount / maxAmount) * 100;
  const barWidth = Math.max(widthPercentage, 2); // Minimum 2% width

  return (
    <div key={month.month}>
      <div
        className="cursor-pointer hover:bg-muted/50 transition-colors p-4"
        onClick={() => {
          const filters = {
            accounts: accountIds,
            date: { type: "years" as const, value: [month.year] },
          };
          navigate(
            render(routes.transactions, {
              query: { filters },
              path: {},
            }),
          );
        }}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-medium text-foreground">
              {month.shortMonth} {month.year}
            </div>
            <div className="font-semibold text-foreground">
              {formatAmount(month.amount, "USD")}
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
