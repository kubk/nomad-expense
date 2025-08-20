import { ChevronRightIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Account, Transaction, Route } from "@/shared/types";
import { TransactionItem } from "../shared/transaction-item";

export function RecentTransactionsOverview({
  transactions,
  accounts,
  setCurrentScreen,
}: {
  transactions: Transaction[];
  accounts: Account[];
  setCurrentScreen: (screen: Route) => void;
}) {
  return (
    <div className="px-4 mt-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold pl-4 text-gray-900">Recent</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentScreen("transactions")}
          className="text-indigo-600 active:scale-95 transition-transform duration-150"
        >
          See all
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </Button>
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
