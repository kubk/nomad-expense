import { Card, CardContent } from "@/components/ui/card";
import { TransactionItem } from "../shared/transaction-item";
import { SummaryCard } from "../shared/summary-card";
import { FiltersDrawer } from "../shared/filters-drawer";
import { useState } from "react";
import { api } from "@/shared/api";
import { TransactionFilters } from "api";
import { useAccountIds } from "@/shared/hooks/use-account-ids";
import { Page } from "../shared/page";
import { RouteByType, useRouter } from "@/shared/stacked-router/router";

export function TransactionsScreen({
  route,
}: {
  route: RouteByType<"transactions">;
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
    api.expenses.transactionsList.useQuery(filters);

  const transactions = transactionsData?.transactions || [];
  const totalExpenses = transactionsData?.totalExpenses || 0;
  const totalIncome = transactionsData?.totalIncome || 0;

  return (
    <Page title="Transactions" bg="secondary">
      <SummaryCard
        isLoading={isLoading}
        onFiltersClick={() => setIsDrawerOpen(true)}
        appliedFilters={filters}
        totalAmount={totalExpenses}
        totalIncome={totalIncome}
      />

      {/* Transactions List */}
      <div className="mt-4">
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
                return (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
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
        filters={filters}
        onApply={(newFilters) => {
          navigate(
            { type: "transactions", filters: newFilters },
            { replace: true },
          );
        }}
      />
    </Page>
  );
}
