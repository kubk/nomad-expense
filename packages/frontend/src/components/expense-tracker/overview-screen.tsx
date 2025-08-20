import { ChevronRightIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonthlyData, Transaction, DateRange, Account } from "./types";
import { TransactionItem } from "./transaction-item";
import { useCurrency } from "./currency-context";
import { currencyService } from "./currency-service";
import { MonthlyChart } from "./monthly-chart";

export function OverviewScreen({
  monthlyData,
  transactions,
  accounts,
  setCurrentScreen,
  setDateRange,
  setSelectedAccount,
}: {
  monthlyData: MonthlyData[];
  transactions: Transaction[];
  accounts: Account[];
  setCurrentScreen: (screen: string) => void;
  setDateRange: (range: DateRange) => void;
  setSelectedAccount: (account: string) => void;
}) {
  const { baseCurrency } = useCurrency();

  // Convert monthly data amounts to base currency
  const convertedMonthlyData = monthlyData.map((month) => ({
    ...month,
    convertedAmount: currencyService.convert(month.amount, "USD", baseCurrency),
  }));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white px-4 py-6 pb-18">
        {/* Total This Month */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
          <p className="text-indigo-100 text-sm mb-1">Total this month</p>
          <p className="text-3xl font-bold">
            {(() => {
              const currentDate = new Date();
              const currentMonth = currentDate.toLocaleDateString("en-US", {
                month: "short",
              });
              const currentYear = currentDate.getFullYear();
              const currentMonthKey = `${currentMonth} ${currentYear}`;
              const monthData = convertedMonthlyData.find(
                (m) => m.month === currentMonthKey,
              );
              return currencyService.formatAmount(
                monthData?.convertedAmount || 0,
                baseCurrency,
              );
            })()}
          </p>
        </div>
      </div>

      {/* Monthly Comparison - Vertical Bar Chart */}
      <div className="px-4 -mt-14">
        <Card className="shadow border-0 gap-0 py-4">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Monthly Breakdown</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentScreen("yearly-breakdown")}
                className="text-indigo-600 -mr-3"
              >
                View all
                <ChevronRightIcon className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pr-4 pt-1">
            <MonthlyChart
              monthlyData={monthlyData}
              setCurrentScreen={setCurrentScreen}
              setDateRange={setDateRange}
              setSelectedAccount={setSelectedAccount}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Preview */}
      <div className="px-4 mt-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold pl-4 text-gray-900">Recent</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentScreen("transactions")}
            className="text-indigo-600"
          >
            See all
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <Card className="border-0 p-0 shadow-sm">
          <CardContent className="p-0">
            {transactions.slice(0, 3).map((t, idx) => {
              const account = accounts.find((a) => a.id === t.account);
              return (
                <TransactionItem
                  key={t.id}
                  transaction={t}
                  account={account}
                  showBorder={idx !== 2}
                />
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
