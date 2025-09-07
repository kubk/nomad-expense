import { RecentTransactionsOverview } from "./recent-transactions-overview";
import { OverviewHeader } from "./overview-header";
import { MonthlyBreakdownOverview } from "./monthly-breakdown-overview";
import { AddTransactionFab } from "./add-transaction-fab";
import { PlainPage } from "../shared/page";

export function OverviewScreen() {
  return (
    <PlainPage className="bg-muted/100 pb-30 overflow-auto">
      <OverviewHeader />
      <MonthlyBreakdownOverview />
      <RecentTransactionsOverview />
      <AddTransactionFab />
    </PlainPage>
  );
}
