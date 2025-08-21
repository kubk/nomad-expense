import { RecentTransactionsOverview } from "./recent-transactions-overview";
import { OverviewHeader } from "./overview-header";
import { MonthlyBreakdownOverview } from "./monthly-breakdown-overview";

export function OverviewScreen() {
  return (
    <div className="min-h-screen pb-20">
      <OverviewHeader />

      <MonthlyBreakdownOverview />

      <RecentTransactionsOverview />
    </div>
  );
}
