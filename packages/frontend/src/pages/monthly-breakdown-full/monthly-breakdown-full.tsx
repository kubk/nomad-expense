import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MonthlyBreakdownItem } from "./monthly-breakdown-item";
import { SummaryCard } from "../shared/summary-card";
import { FiltersDrawer } from "../shared/filters-drawer";
import { PageHeader } from "../shared/page-header";
import { api } from "../../shared/api";
import { TransactionFilters } from "api";
import { useAccountIds } from "@/shared/hooks/use-account-ids";
import { Page } from "../shared/page";
import { RouteByType } from "@/shared/stacked-router/router";
import { useRouter } from "@/shared/stacked-router/router";

export function MonthlyBreakdownFull({
  route,
}: {
  route: RouteByType<"monthlyBreakdownFull">;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { navigate } = useRouter();
  const accountIds = useAccountIds();

  const filters: TransactionFilters = route.filters
    ? route.filters
    : {
        accounts: accountIds,
        date: { type: "months", value: 3 },
      };

  const { data: transactionsData, isLoading } =
    api.expenses.transactionsByMonth.useQuery(filters);

  const filteredMonthlyData = transactionsData?.data || [];
  const maxAmount = transactionsData?.maxAmount || 0;
  const totalExpenses = transactionsData?.totalExpenses || 0;
  const totalIncome = transactionsData?.totalIncome || 0;

  return (
    <Page title="Monthly breakdown" bg="secondary">
      <SummaryCard
        isLoading={isLoading}
        onFiltersClick={() => setIsDrawerOpen(true)}
        appliedFilters={filters}
        totalAmount={totalExpenses}
        totalIncome={totalIncome}
      />

      {/* All Months - Transaction Style List */}
      <Card className="mt-4 shadow border-0 p-0">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <div className="animate-pulse space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-muted h-16 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            filteredMonthlyData.map((month, index) => (
              <MonthlyBreakdownItem
                key={month.month}
                month={month}
                index={index}
                totalItems={filteredMonthlyData.length}
                maxAmount={maxAmount}
              />
            ))
          )}
        </CardContent>
      </Card>

      <FiltersDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        filters={filters}
        onApply={(newFilters) => {
          navigate(
            {
              type: "monthlyBreakdownFull",
              filters: newFilters,
            },
            { replace: true },
          );
        }}
      />
    </Page>
  );
}
