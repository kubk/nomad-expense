import { ChevronRightIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { render } from "typesafe-routes";
import { routes } from "../../shared/routes";
import { MonthlyChart } from "./monthly-chart";
import { useAccountIds } from "@/shared/hooks/use-account-ids";
import { useLocation } from "wouter";

export function MonthlyBreakdownOverview() {
  const accountIds = useAccountIds();
  const [, navigate] = useLocation();

  return (
    <div className="px-4 -mt-14">
      <Card
        className="shadow border-0 gap-0 py-4 cursor-pointer"
        onClick={() =>
          navigate(
            render(routes.monthlyBreakdownFull, {
              query: {
                filters: {
                  accounts: accountIds,
                  date: { type: "months", value: 3 },
                },
              },
              path: {},
            }),
          )
        }
      >
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Monthly breakdown</CardTitle>
            <span className="text-primary/70 -mr-3 inline-flex items-center text-sm font-medium">
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
