import { Card, CardContent } from "@/components/ui/card";
import { TransactionItem } from "../shared/transaction-item";
import { SummaryCard } from "../shared/summary-card";
import { FiltersDrawer } from "../shared/filters-drawer";
import { useState } from "react";
import { trpc } from "@/shared/api";
import { useQuery } from "@tanstack/react-query";
import { TransactionFilters } from "api";
import { useAccountIds } from "@/shared/hooks/use-account-ids";
import { Page } from "../shared/page";
import { RouteByType, useRouter } from "@/shared/stacked-router/router";
import { VList } from "virtua";
import { FilterIcon } from "lucide-react";

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
        order: { field: "createdAt", direction: "desc" },
      };

  const { data: transactionsData, isLoading } = useQuery(
    trpc.expenses.transactionsList.queryOptions(filters),
  );

  const transactions = transactionsData?.transactions || [];
  const totalExpenses = transactionsData?.totalExpenses || 0;
  const totalIncome = transactionsData?.totalIncome || 0;

  return (
    <Page title="Transactions">
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
            ) : transactions.length >= 6 ? (
              <VList style={{ height: 600 }}>
                {transactions.map((transaction, idx) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    showBorder={idx !== transactions.length - 1}
                  />
                ))}
              </VList>
            ) : transactions.length > 0 ? (
              <div>
                {transactions.map((transaction, idx) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    showBorder={idx !== transactions.length - 1}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <FilterIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No transactions found
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  Try updating your filters to see more transactions
                </p>
              </div>
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
