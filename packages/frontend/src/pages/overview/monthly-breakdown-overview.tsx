import { ChevronRightIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyChart } from "./monthly-chart";
import { useAccountIds } from "@/shared/hooks/use-account-ids";
import { useRouter } from "@/shared/stacked-router/router";

export function MonthlyBreakdownOverview() {
  const accountIds = useAccountIds();
  const { navigate } = useRouter();

  return (
    <div className="px-4 -mt-14">
      <Card className="shadow border-0 gap-0 py-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Monthly breakdown</CardTitle>
            <span
              className="text-primary/70 -mr-3 inline-flex items-center text-sm font-medium cursor-pointer active:scale-95 transition-transform"
              onClick={() =>
                navigate({
                  type: "monthlyBreakdownFull",
                  filters: {
                    accounts: accountIds,
                    date: { type: "months", value: 6 },
                    order: { field: "createdAt", direction: "desc" },
                  },
                })
              }
            >
              View all
              <ChevronRightIcon className="w-3 h-3 ml-1" />
            </span>
          </div>
        </CardHeader>
        <CardContent className="pr-4 pt-1">
          <MonthlyChart />
        </CardContent>
      </Card>
    </div>
  );
}
