import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonthlyData, DateRange } from "./types";

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
}: YearlyBreakdownScreenProps) => (
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

    {/* All Months Chart */}
    <div className="px-4 mt-4">
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            All Months ({Math.min(...monthlyData.map((m) => m.year))}-
            {Math.max(...monthlyData.map((m) => m.year))})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Previous Year Section */}
            {monthlyData.filter((m) => m.year < new Date().getFullYear())
              .length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {Math.min(
                    ...monthlyData
                      .filter((m) => m.year < new Date().getFullYear())
                      .map((m) => m.year),
                  )}
                </h3>
                <div className="space-y-2">
                  {monthlyData
                    .filter((m) => m.year < new Date().getFullYear())
                    .map((month, index) => {
                      const startDate = `${month.year}-${String(index + 1).padStart(2, "0")}-01`;
                      const endDate = new Date(month.year, index + 1, 0)
                        .toISOString()
                        .split("T")[0];
                      const maxAmount = Math.max(
                        ...monthlyData.map((m) => m.amount),
                      );

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
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-900">
                              {month.shortMonth}
                            </span>
                            <span className="text-xs font-semibold text-gray-900">
                              ${(month.amount / 1000).toFixed(1)}k
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                              style={{
                                width: `${(month.amount / maxAmount) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Current Year Section */}
            {monthlyData.filter((m) => m.year === new Date().getFullYear())
              .length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {new Date().getFullYear()}
                </h3>
                <div className="space-y-2">
                  {monthlyData
                    .filter((m) => m.year === new Date().getFullYear())
                    .map((month) => {
                      const startDate = `${month.year}-01-01`;
                      const endDate = new Date(month.year, 1, 0)
                        .toISOString()
                        .split("T")[0];
                      const maxAmount = Math.max(
                        ...monthlyData.map((m) => m.amount),
                      );

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
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-900">
                              {month.shortMonth}
                            </span>
                            <span className="text-xs font-semibold text-gray-900">
                              ${(month.amount / 1000).toFixed(1)}k
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                              style={{
                                width: `${(month.amount / maxAmount) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Year Summary */}
    <div className="px-4 mt-4">
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
        <CardContent className="p-4">
          <p className="text-indigo-100 text-sm">
            Total {new Date().getFullYear()}
          </p>
          <p className="text-2xl font-bold mt-1">
            $
            {monthlyData
              .filter((m) => m.year === new Date().getFullYear())
              .reduce((sum, m) => sum + m.amount, 0)
              .toFixed(2)}
          </p>
          <p className="text-indigo-100 text-xs mt-2">
            {
              monthlyData.filter((m) => m.year === new Date().getFullYear())
                .length
            }{" "}
            months
          </p>
        </CardContent>
      </Card>
    </div>

    {/* Monthly Stats */}
    <div className="px-4 mt-4">
      <h2 className="font-semibold text-gray-900 mb-3">Monthly Statistics</h2>
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <p className="text-sm font-medium text-gray-900">Highest Month</p>
            <p className="text-lg font-bold text-green-600">
              ${Math.max(...monthlyData.map((m) => m.amount)).toFixed(0)}
            </p>
            <p className="text-xs text-gray-500">
              {
                monthlyData.find(
                  (m) =>
                    m.amount === Math.max(...monthlyData.map((m) => m.amount)),
                )?.shortMonth
              }
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <p className="text-sm font-medium text-gray-900">Lowest Month</p>
            <p className="text-lg font-bold text-blue-600">
              ${Math.min(...monthlyData.map((m) => m.amount)).toFixed(0)}
            </p>
            <p className="text-xs text-gray-500">
              {
                monthlyData.find(
                  (m) =>
                    m.amount === Math.min(...monthlyData.map((m) => m.amount)),
                )?.shortMonth
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);
