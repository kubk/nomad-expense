import { useState } from "react";
import { SettingsIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonthlyBreakdownItem } from "./monthly-breakdown-item";
import {
  TransactionFiltersSummary,
  TransactionListSkeleton,
} from "../widgets/summary-card";
import { FiltersDrawer } from "../widgets/filters-drawer";
import { Page } from "../widgets/page";
import { PageHeader } from "../widgets/page-header";
import {
  type RouteByType,
  routerStore,
} from "@/shared/stacked-router/router-store";
import { calculateMaxAmount } from "../../shared/chart-calculations";
import { t } from "@/translations/translation-store";
import { haptic } from "@/shared/platform/haptics";
import { MonthlyBreakdownFullStore } from "./monthly-breakdown-full-store";

export function MonthlyBreakdownFull({
  route,
}: {
  route: RouteByType<"monthlyBreakdownFull">;
}) {
  const [store] = useState(() => new MonthlyBreakdownFullStore(route.filters));
  const filteredMonthlyData = store.months;
  const maxAmount = calculateMaxAmount(filteredMonthlyData);

  return (
    <Page
      title={
        <PageHeader
          title={t("overviewMonthlyBreakdown")}
          rightSlot={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                haptic("light");
                routerStore.navigate({ type: "monthlyBreakdownSettings" });
              }}
            >
              <SettingsIcon className="w-4 h-4" />
            </Button>
          }
        />
      }
    >
      <TransactionFiltersSummary store={store} />

      {/* All Months - Transaction Style List */}
      <Card className="mt-4 shadow border-0 p-0">
        <CardContent className="p-0">
          {store.isLoading ? (
            <TransactionListSkeleton />
          ) : (
            filteredMonthlyData.map((month, index) => (
              <MonthlyBreakdownItem
                key={month.month}
                month={month}
                index={index}
                totalItems={filteredMonthlyData.length}
                maxAmount={maxAmount}
                onMonthClick={store.openMonth}
              />
            ))
          )}
        </CardContent>
      </Card>

      <FiltersDrawer target={store.filtersState} />
    </Page>
  );
}
