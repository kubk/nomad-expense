import { ChevronRightIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { MonthlyData } from "../../shared/types";
import { MonthlyChart } from "./monthly-chart";

export function MonthlyBreakdownOverview({
  monthlyData,
  setDateRange,
  setSelectedAccount,
}: {
  monthlyData: MonthlyData[];
  setDateRange: (range: any) => void;
  setSelectedAccount: (account: string) => void;
}) {
  return (
    <div className="px-4 -mt-14">
      <Card className="shadow border-0 gap-0 py-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Monthly breakdown</CardTitle>
            <Link
              href="/monthly-breakdown-full"
              className="text-indigo-600 -mr-3 active:scale-95 transition-transform duration-150 inline-flex items-center text-sm font-medium hover:underline"
            >
              View all
              <ChevronRightIcon className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pr-4 pt-1">
          <MonthlyChart
            monthlyData={monthlyData}
            setDateRange={setDateRange}
            setSelectedAccount={setSelectedAccount}
          />
        </CardContent>
      </Card>
    </div>
  );
}
