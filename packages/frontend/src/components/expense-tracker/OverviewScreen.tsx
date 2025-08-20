import { ChevronRight, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Account, MonthlyData, Transaction, DateRange } from "./types";
import { formatDisplayDate } from "./utils";

interface OverviewScreenProps {
  accounts: Account[];
  monthlyData: MonthlyData[];
  transactions: Transaction[];
  setCurrentScreen: (screen: string) => void;
  setDateRange: (range: DateRange) => void;
  setSelectedAccount: (account: string) => void;
}

export const OverviewScreen = ({
  accounts,
  monthlyData,
  transactions,
  setCurrentScreen,
  setDateRange,
  setSelectedAccount,
}: OverviewScreenProps) => (
  <div className="min-h-screen bg-gray-50 pb-20">
    {/* Header */}
    <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white p-6 pb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-indigo-100 text-sm mt-1">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/20 text-white border-0 backdrop-blur"
          onClick={() => setCurrentScreen("transactions")}
        >
          <Filter className="w-4 h-4 mr-1" />
          Filter
        </Button>
      </div>

      {/* Total This Month */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
        <p className="text-indigo-100 text-sm mb-1">Total this month (USD)</p>
        <p className="text-3xl font-bold">
          $
          {(() => {
            const currentDate = new Date();
            const currentMonth = currentDate.toLocaleDateString("en-US", {
              month: "short",
            });
            const currentYear = currentDate.getFullYear();
            const currentMonthKey = `${currentMonth} ${currentYear}`;
            return (
              monthlyData
                .find((m) => m.month === currentMonthKey)
                ?.amount.toFixed(2) || "0.00"
            );
          })()}
        </p>
      </div>
    </div>

    {/* Monthly Comparison */}
    <div className="px-4 -mt-4">
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Monthly Breakdown</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentScreen("yearly-breakdown")}
              className="text-indigo-600 text-xs"
            >
              View all
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {monthlyData.slice(-4).map((month, index) => {
              const monthIndex = monthlyData.length - 4 + index;
              const startDate = `${month.year}-${String((monthIndex % 12) + 1).padStart(2, "0")}-01`;
              const endDate = new Date(month.year, (monthIndex % 12) + 1, 0)
                .toISOString()
                .split("T")[0];
              const maxAmount = Math.max(...monthlyData.map((m) => m.amount));

              return (
                <div
                  key={month.month}
                  className="cursor-pointer hover:opacity-80 transition-opacity p-2 rounded-lg hover:bg-gray-50"
                  onClick={() => {
                    setDateRange({ from: startDate, to: endDate });
                    setSelectedAccount("all");
                    setCurrentScreen("transactions");
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {month.shortMonth}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${(month.amount / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(month.amount / maxAmount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Accounts Quick Access */}
    <div className="px-4 mt-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-gray-900">Accounts</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentScreen("accounts")}
          className="text-indigo-600"
        >
          View all
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {accounts.slice(0, 4).map((account) => (
          <Card
            key={account.id}
            className="border cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setSelectedAccount(account.id);
              setCurrentScreen("transactions");
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className={`w-2 h-2 rounded-full ${account.color}`} />
                <Badge variant="outline" className="text-xs">
                  {account.currency}
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-900 truncate">
                {account.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">12 transactions</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>

    {/* Recent Transactions Preview */}
    <div className="px-4 mt-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-gray-900">Recent</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentScreen("transactions")}
          className="text-indigo-600"
        >
          See all
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {transactions.slice(0, 3).map((t, idx) => (
            <div
              key={t.id}
              className={`flex items-center justify-between p-4 ${
                idx !== 2 ? "border-b" : ""
              }`}
            >
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">{t.desc}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDisplayDate(t.date)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">
                  {t.currency} {t.amount.toFixed(2)}
                </p>
                {t.currency !== "USD" && (
                  <p className="text-xs text-gray-500">${t.usd.toFixed(2)}</p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);
