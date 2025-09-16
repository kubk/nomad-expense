import { RecentTransactionsOverview } from "./recent-transactions-overview";
import { OverviewHeader } from "./overview-header";
import { MonthlyBreakdownOverview } from "./monthly-breakdown-overview";
import { AddTransactionFab } from "./add-transaction-fab";
import { cn } from "@/lib/utils";

export function OverviewScreen() {
  return (
    <div
      className={cn("flex flex-col h-full bg-muted/100 pb-30 overflow-auto")}
    >
      <OverviewHeader />
      <MonthlyBreakdownOverview />
      <RecentTransactionsOverview />
      <AddTransactionFab />
    </div>
  );
}
