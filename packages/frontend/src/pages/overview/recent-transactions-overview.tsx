import { ChevronRightIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { TransactionItem } from "../shared/transaction-item";
import { expenseStore } from "@/store/expense-store";

export function RecentTransactionsOverview() {
  return (
    <div className="px-4 mt-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold pl-4 text-foreground">Recent</h2>
        <Link
          href="/transactions"
          className="text-primary/70 active:scale-95 transition-transform duration-150 inline-flex items-center text-sm font-medium hover:underline"
        >
          See all
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <Card className="border-0 p-0 shadow-sm">
        <CardContent className="p-0">
          {expenseStore.recentTransactions.map((t, idx) => {
            const account = expenseStore.accounts.find(
              (a) => a.id === t.account,
            );
            return (
              <TransactionItem
                key={t.id}
                transaction={t}
                account={account}
                showBorder={idx !== 2}
              />
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
