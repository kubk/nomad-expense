import { useState } from "react";
import { useSearch, useLocation } from "wouter";
import { safeParseQuery, render } from "typesafe-routes";
import { Card, CardContent } from "@/components/ui/card";
import { MonthlyBreakdownItem } from "./monthly-breakdown-item";
import { SummaryCard } from "../shared/summary-card";
import { FiltersDrawer } from "../shared/filters-drawer";
import { PageHeader } from "../shared/page-header";
import { routes } from "../../routes";
import { api } from "../../api";
import { TransactionFilters } from "api";
import { useAccountIds } from "@/shared/hooks/use-account-ids";
import { Page } from "../shared/page";

export function MonthlyBreakdownFull() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [, navigate] = useLocation();
  const accountIds = useAccountIds();

  const parsedQuery = safeParseQuery(routes.monthlyBreakdownFull, useSearch());

  const filters: TransactionFilters = parsedQuery.success
    ? parsedQuery.data.filters
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
    <Page>
      <PageHeader title="Monthly breakdown" />

      <SummaryCard
        isLoading={isLoading}
        onFiltersClick={() => setIsDrawerOpen(true)}
        appliedFilters={filters}
        totalAmount={totalExpenses}
        totalIncome={totalIncome}
      />

      {/* All Months - Transaction Style List */}
      <div className="px-4 mt-4">
        <Card className="shadow border-0 p-0">
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
      </div>

      <FiltersDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        filters={filters}
        onApply={(newFilters) => {
          navigate(
            render(routes.monthlyBreakdownFull, {
              query: { filters: newFilters },
              path: {},
            }),
            { replace: true },
          );
        }}
      />
    </Page>
  );
}
