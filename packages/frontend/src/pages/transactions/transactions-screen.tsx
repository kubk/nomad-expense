import { FilterIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionItem } from "../shared/transaction-item";
import { SummaryCard } from "../shared/summary-card";
import { FiltersDrawer } from "../shared/filters-drawer";
import { PageHeader } from "../shared/page-header";
import { useState } from "react";
import { useSearch, useLocation } from "wouter";
import { safeParseQuery, render } from "typesafe-routes";
import { routes } from "../../routes";
import { api } from "@/api";
import { TransactionFilters } from "api";
import { useAccountIds } from "@/shared/hooks/use-account-ids";

export function TransactionsScreen() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [, navigate] = useLocation();
  const accountIds = useAccountIds();
  const { data: accounts = [] } = api.accounts.list.useQuery();

  const parsedQuery = safeParseQuery(routes.transactions, useSearch());

  const filters: TransactionFilters = parsedQuery.success
    ? parsedQuery.data.filters
    : {
        accounts: accountIds,
        date: { type: "months", value: 3 },
      };

  const { data: transactionsData, isLoading } =
    api.expenses.transactionsList.useQuery(filters);

  const transactions = transactionsData?.transactions || [];
  const totalInUSD = transactionsData?.totalInUSD || 0;

  // Get available years from overview data for the filter
  const { data: overviewData } = api.expenses.overview.useQuery();
  const availableYears = overviewData
    ? [...new Set(overviewData.data.map((m) => m.year))].sort((a, b) => b - a)
    : [];

  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        title="Transactions"
        rightSlot={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDrawerOpen(true)}
          >
            <FilterIcon className="w-4 h-4" />
          </Button>
        }
      />

      <SummaryCard
        onFiltersClick={() => setIsDrawerOpen(true)}
        appliedFilters={filters}
        totalAmount={totalInUSD}
      />

      {/* Transactions List */}
      <div className="px-4 mt-4">
        <Card className="border-0 p-0 shadow-sm">
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
              transactions.map((transaction, idx) => {
                const account = accounts.find(
                  (a) => a.id === transaction.account,
                );
                return (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    account={account}
                    showBorder={idx !== transactions.length - 1}
                  />
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <FiltersDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        availableYears={availableYears}
        filters={filters}
        onApply={(newFilters) => {
          navigate(
            render(routes.transactions, {
              query: { filters: newFilters },
              path: {},
            }),
            { replace: true },
          );
        }}
      />
    </div>
  );
}
