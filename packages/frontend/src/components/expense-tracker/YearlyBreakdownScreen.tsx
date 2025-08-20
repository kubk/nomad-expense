import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonthlyData, DateRange } from "./types";
import { useCurrency } from "./currency-context";
import { currencyService } from "./currency-service";

interface YearlyBreakdownScreenProps {
  monthlyData: MonthlyData[];
  setCurrentScreen: (screen: string) => void;
  setDateRange: (range: DateRange) => void;
  setSelectedAccount: (account: string) => void;
}

export const YearlyBreakdownScreen = ({
  monthlyData,
  setCurrentScreen,
  setDateRange,
  setSelectedAccount,
}: YearlyBreakdownScreenProps) => {
  const { baseCurrency, formatAmount } = useCurrency();

  // Convert monthly data amounts to base currency and sort by newest first
  const convertedMonthlyData = monthlyData
    .map((month) => ({
      ...month,
      convertedAmount: currencyService.convert(
        month.amount,
        "USD",
        baseCurrency,
      ),
    }))
    .sort((a, b) => {
      // Sort by year first (descending), then by month (descending)
      if (a.year !== b.year) {
        return b.year - a.year;
      }
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
      const aMonthIndex = monthNames.indexOf(a.shortMonth);
      const bMonthIndex = monthNames.indexOf(b.shortMonth);
      return bMonthIndex - aMonthIndex;
    });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentScreen("overview")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h1 className="font-semibold text-gray-900">Monthly Breakdown</h1>
          <div className="w-[60px]" />
        </div>
      </div>

      {/* All Months - Transaction Style List */}
      <div className="px-4 mt-4">
        <Card className="shadow border-0 p-0">
          <CardContent className="p-0">
            {convertedMonthlyData.map((month, index) => {
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
                        <div className="text-sm text-gray-500">
                          Monthly expenses
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatAmount(month.convertedAmount, baseCurrency)}
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < convertedMonthlyData.length - 1 && (
                    <div className="border-b border-gray-200" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Year Summary */}
      <div className="px-4 mt-4">
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
          <CardContent className="px-4">
            <p className="text-indigo-100 text-sm">
              Total {new Date().getFullYear()}
            </p>
            <p className="text-2xl font-bold mt-1">
              {formatAmount(
                convertedMonthlyData
                  .filter((m) => m.year === new Date().getFullYear())
                  .reduce((sum, m) => sum + m.convertedAmount, 0),
                baseCurrency,
              )}
            </p>
            <p className="text-indigo-100 text-xs mt-2">
              {
                convertedMonthlyData.filter(
                  (m) => m.year === new Date().getFullYear(),
                ).length
              }{" "}
              months
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
