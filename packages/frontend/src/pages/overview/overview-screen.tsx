import { RecentTransactionsOverview } from "./recent-transactions-overview";
import { OverviewHeader } from "./overview-header";
import { MonthlyBreakdownOverview } from "./monthly-breakdown-overview";
import { Page } from "../shared/page";

export function OverviewScreen() {
  return (
    <Page>
      <OverviewHeader />
      <MonthlyBreakdownOverview />
      <RecentTransactionsOverview />
    </Page>
  );
}
