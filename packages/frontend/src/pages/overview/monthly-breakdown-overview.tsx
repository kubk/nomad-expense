import { ChevronRightIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyChart } from "./monthly-chart";
import { useRouter } from "@/shared/stacked-router/router";
import { haptic } from "@/shared/platform/haptics";
import { useTranslation } from "@/translations/translation-provider";
import { useMonthlyBreakdownAccountIds } from "@/shared/hooks/use-monthly-breakdown-settings";
import type { RouterOutputs } from "api";

type OverviewData = RouterOutputs["expenses"]["overview"];

export function MonthlyBreakdownOverview({
  overviewPages,
  isLoading,
  isFetchingPreviousPage,
  hasPreviousPage,
  fetchPreviousPage,
}: {
  overviewPages: OverviewData[];
  isLoading: boolean;
  isFetchingPreviousPage: boolean;
  hasPreviousPage: boolean;
  fetchPreviousPage: () => Promise<unknown>;
}) {
  const { includedAccountIds } = useMonthlyBreakdownAccountIds();
  const { navigate } = useRouter();
  const { t } = useTranslation();

  return (
    <div className="px-4 -mt-14">
      <Card className="shadow-sm border-0 gap-0 py-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">
              {t("overviewMonthlyBreakdown")}
            </CardTitle>
            <span
              className="text-primary/70 -mr-3 inline-flex items-center text-sm font-medium cursor-pointer active:scale-95 transition-transform"
              onClick={() => {
                haptic("light");
                navigate({
                  type: "monthlyBreakdownFull",
                  filters: {
                    accounts: includedAccountIds,
                    date: { type: "months", value: 6 },
                    order: { field: "createdAt", direction: "desc" },
                  },
                });
              }}
            >
              {t("overviewViewAll")}
              <ChevronRightIcon className="w-3 h-3 ml-1" />
            </span>
          </div>
        </CardHeader>
        <CardContent className="pr-4 pt-1">
          <MonthlyChart
            overviewPages={overviewPages}
            isLoading={isLoading}
            isFetchingPreviousPage={isFetchingPreviousPage}
            hasPreviousPage={hasPreviousPage}
            fetchPreviousPage={fetchPreviousPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
