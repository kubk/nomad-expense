import { ChevronRightIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TransactionItem } from "../shared/transaction-item";
import { trpc } from "../../shared/api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@/shared/stacked-router/router";

export function RecentTransactionsOverview() {
  const { navigate } = useRouter();
  const { data: overviewData, isLoading } = useQuery(
    trpc.expenses.overview.queryOptions(),
  );

  const recentTransactions = overviewData?.recentTransactions;

  if (!isLoading && recentTransactions?.length === 0) {
    return null;
  }

  return (
    <div className="px-4 mt-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold pl-4 text-foreground">Recent</h2>
        <button
          onClick={() => navigate({ type: "transactions" })}
          className="text-primary/70 active:scale-95 transition-transform duration-150 inline-flex items-center text-sm font-medium"
        >
          See all
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </button>
      </div>

      <Card className="border-0 p-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-muted h-16 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            recentTransactions?.map((t, idx) => (
              <TransactionItem
                key={t.id}
                transaction={t}
                showBorder={idx !== 2}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
