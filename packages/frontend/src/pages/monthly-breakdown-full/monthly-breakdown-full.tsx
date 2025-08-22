import { useState } from "react";
import { useSearch } from "wouter";
import { safeParseQuery } from "typesafe-routes";
import { Card, CardContent } from "@/components/ui/card";
import { MonthlyBreakdownItem } from "./monthly-breakdown-item";
import { YearSummaryCard } from "./year-summary-card";
import { FiltersDrawer } from "./filters-drawer";
import { PageHeader } from "../shared/page-header";
import { expenseStore } from "@/store/expense-store";
import { routes } from "../../routes";
import { api } from "../../api";
import { MonthlyBreakdownFilters } from "api";

export function MonthlyBreakdownFull() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const parsedQuery = safeParseQuery(routes.monthlyBreakdownFull, useSearch());

  const appliedFilters: MonthlyBreakdownFilters = parsedQuery.success
    ? parsedQuery.data.filters
    : {
        accounts: expenseStore.accounts.map((a) => a.id),
        date: { type: "months", value: 3 },
      };

  const { data: transactionsData, isLoading } =
    api.expenses.transactions.useQuery(appliedFilters);

  const filteredMonthlyData = transactionsData?.data || [];
  const maxAmount = transactionsData?.maxAmount || 0;

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title="Monthly breakdown" />

      <YearSummaryCard
        convertedMonthlyData={filteredMonthlyData}
        onFiltersClick={() => setIsDrawerOpen(true)}
        appliedFilters={appliedFilters}
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
              filteredMonthlyData.map((month: any, index: number) => (
                <MonthlyBreakdownItem
                  key={month.month}
                  month={month}
                  index={index}
                  totalItems={filteredMonthlyData.length}
                  maxAmount={maxAmount}
                  setDateRange={expenseStore.setDateRange}
                  setSelectedAccount={expenseStore.setSelectedAccount}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <FiltersDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        monthlyData={expenseStore.monthlyData}
        appliedFilters={appliedFilters}
      />
    </div>
  );
}
