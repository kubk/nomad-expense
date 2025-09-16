import { RecentTransactionsOverview } from "./recent-transactions-overview";
import { OverviewHeader } from "./overview-header";
import { MonthlyBreakdownOverview } from "./monthly-breakdown-overview";
import { AddTransactionFab } from "./add-transaction-fab";
import { cn } from "@/lib/utils";
import { useTgHeaderColorSync } from "@/shared/use-tg-header-color-sync";

export function OverviewScreen() {
  useTgHeaderColorSync("secondary");

  return (
    <div className={cn("flex flex-col h-full bg-muted pb-30 overflow-auto")}>
      <OverviewHeader />
      <MonthlyBreakdownOverview />
      <RecentTransactionsOverview />
      <AddTransactionFab />
    </div>
  );
}
