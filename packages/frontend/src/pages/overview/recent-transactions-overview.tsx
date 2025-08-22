import { ChevronRightIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { renderPath } from "typesafe-routes";
import { routes } from "../../routes";
import { TransactionItem } from "../shared/transaction-item";
import { api } from "../../api";

export function RecentTransactionsOverview() {
  const { data: recentTransactions, isLoading } =
    api.expenses.recentTransactions.useQuery();

  return (
    <div className="px-4 mt-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold pl-4 text-foreground">Recent</h2>
        <Link
          href={renderPath(routes.transactions, {})}
          className="text-primary/70 active:scale-95 transition-transform duration-150 inline-flex items-center text-sm font-medium"
        >
          See all
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </Link>
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
                account={t.accountDetails}
                showBorder={idx !== 2}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
