import { Card, CardContent } from "@/components/ui/card";
import { MonthlyData } from "./types";
import { useCurrency } from "./currency-context";
import { currencyService } from "./currency-service";

export function YearSummaryCard({
  convertedMonthlyData,
}: {
  convertedMonthlyData: (MonthlyData & { convertedAmount: number })[];
}) {
  const { baseCurrency } = useCurrency();

  const currentYear = new Date().getFullYear();
  const currentYearData = convertedMonthlyData.filter(
    (m) => m.year === currentYear,
  );
  const totalAmount = currentYearData.reduce(
    (sum, m) => sum + m.convertedAmount,
    0,
  );

  return (
    <div className="px-4 mt-4">
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
        <CardContent className="px-4">
          <p className="text-indigo-100 text-sm">Total {currentYear}</p>
          <p className="text-2xl font-bold mt-1">
            {currencyService.formatAmount(totalAmount, baseCurrency)}
          </p>
          <p className="text-indigo-100 text-xs mt-2">
            {currentYearData.length} months
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
