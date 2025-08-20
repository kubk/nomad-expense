import { ChevronRightIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Account, Transaction } from "@/shared/types";
import { TransactionItem } from "../shared/transaction-item";

export function RecentTransactionsOverview({
  transactions,
  accounts,
}: {
  transactions: Transaction[];
  accounts: Account[];
}) {
  return (
    <div className="px-4 mt-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold pl-4 text-foreground">Recent</h2>
        <Link
          href="/transactions"
          className="text-primary active:scale-95 transition-transform duration-150 inline-flex items-center text-sm font-medium hover:underline"
        >
          See all
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <Card className="border-0 p-0 shadow-sm">
        <CardContent className="p-0">
          {transactions.slice(0, 3).map((t, idx) => {
            const account = accounts.find((a) => a.id === t.account);
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
