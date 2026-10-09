import { getTransactionMonthRange } from "@/shared/transaction-date-range";
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
import { trpc } from "../../shared/api";
import { useQuery } from "@tanstack/react-query";
import { TransactionFilters } from "api";
import { Page } from "../widgets/page";
import { PageHeader } from "../widgets/page-header";
import { RouteByType } from "@/shared/stacked-router/router";
import { useRouter } from "@/shared/stacked-router/router";
import { isFormRoute } from "@/shared/stacked-router/routes";
import { calculateMaxAmount } from "../../shared/chart-calculations";
import { useTranslation } from "@/translations/translation-provider";
import { haptic } from "@/shared/platform/haptics";
import { useMonthlyBreakdownAccountIds } from "@/shared/hooks/use-monthly-breakdown-settings";

export function MonthlyBreakdownFull({
  route,
}: {
  route: RouteByType<"monthlyBreakdownFull">;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { includedAccountIds, isLoading: isMonthlyBreakdownAccountsLoading } =
    useMonthlyBreakdownAccountIds();

  const baseFilters: TransactionFilters = route.filters
    ? route.filters
    : {
        accounts: includedAccountIds,
        date: { type: "days", value: 90 },
        order: { field: "createdAt", direction: "desc" },
      };

  const filters: TransactionFilters = {
    ...baseFilters,
    accounts: baseFilters.accounts.filter((accountId) =>
      includedAccountIds.includes(accountId),
    ),
  };

  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery(
    {
      ...trpc.expenses.transactionsByMonth.queryOptions(filters),
      enabled: !isMonthlyBreakdownAccountsLoading,
    },
  );
  const isLoading = isMonthlyBreakdownAccountsLoading || isTransactionsLoading;

  const openFilters = () => setIsDrawerOpen(true);

  const filteredMonthlyData = transactionsData?.data || [];
  const maxAmount = calculateMaxAmount(filteredMonthlyData);
  const totalExpenses = transactionsData?.totalExpenses || 0;
  const totalIncome = transactionsData?.totalIncome || 0;

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
                navigate({ type: "monthlyBreakdownSettings" });
              }}
            >
              <SettingsIcon className="w-4 h-4" />
            </Button>
          }
        />
      }
      isForm={isFormRoute(route)}
    >
      <TransactionFiltersSummary
        isLoading={isLoading}
        onFiltersClick={openFilters}
        filters={filters}
        totalExpenses={totalExpenses}
        totalIncome={totalIncome}
      />

      {/* All Months - Transaction Style List */}
      <Card className="mt-4 shadow border-0 p-0">
        <CardContent className="p-0">
          {isLoading ? (
            <TransactionListSkeleton />
          ) : (
            filteredMonthlyData.map((month, index) => (
              <MonthlyBreakdownItem
                key={month.month}
                month={month}
                index={index}
                totalItems={filteredMonthlyData.length}
                maxAmount={maxAmount}
                onMonthClick={(month) => {
                  navigate({
                    type: "transactions",
                    filters: {
                      ...filters,
                      date: getTransactionMonthRange(month.year, month.monthNumber),
                    },
                  });
                }}
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
