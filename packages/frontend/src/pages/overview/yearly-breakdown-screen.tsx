import { ArrowLeftIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonthlyData, DateRange } from "../../shared/types";
import { useCurrency } from "../../shared/currency-context";
import { currencyService } from "../../shared/currency-service";
import { MonthlyBreakdownItem } from "./monthly-breakdown-item";
import { YearSummaryCard } from "./year-summary-card";

export function YearlyBreakdownScreen({
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
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
          </Button>
          <h1 className="font-semibold text-gray-900">Monthly breakdown</h1>
          <div className="w-[60px]" />
        </div>
      </div>

      {/* All Months - Transaction Style List */}
      <div className="px-4 mt-4">
        <Card className="shadow border-0 p-0">
          <CardContent className="p-0">
            {convertedMonthlyData.map((month, index) => (
              <MonthlyBreakdownItem
                key={month.month}
                month={month}
                index={index}
                totalItems={convertedMonthlyData.length}
                setDateRange={setDateRange}
                setSelectedAccount={setSelectedAccount}
                setCurrentScreen={setCurrentScreen}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Year Summary */}
      <YearSummaryCard convertedMonthlyData={convertedMonthlyData} />
    </div>
  );
}
