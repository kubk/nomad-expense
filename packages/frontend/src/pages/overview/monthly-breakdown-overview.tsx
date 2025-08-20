import { ChevronRightIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonthlyData } from "../../shared/types";
import { MonthlyChart } from "./monthly-chart";

export function MonthlyBreakdownOverview({
  monthlyData,
  setCurrentScreen,
  setDateRange,
  setSelectedAccount,
}: {
  monthlyData: MonthlyData[];
  setCurrentScreen: (screen: string) => void;
  setDateRange: (range: any) => void;
  setSelectedAccount: (account: string) => void;
}) {
  return (
    <div className="px-4 -mt-14">
      <Card className="shadow border-0 gap-0 py-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Monthly breakdown</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentScreen("yearly-breakdown")}
              className="text-indigo-600 -mr-3 active:scale-95 transition-transform duration-150"
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
  );
}
