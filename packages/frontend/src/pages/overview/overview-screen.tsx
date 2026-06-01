import { RecentTransactionsOverview } from "./recent-transactions-overview";
import { OverviewHeader } from "./overview-header";
import { MonthlyBreakdownOverview } from "./monthly-breakdown-overview";
import { AddTransactionFab } from "./add-transaction-fab";
import { cn } from "@/lib/utils";
import { RouteByType } from "@/shared/stacked-router/router";
import { trpc } from "@/shared/api";
import { useInfiniteQuery } from "@tanstack/react-query";

export function OverviewScreen({ route: _ }: { route: RouteByType<"main"> }) {
  const overviewQuery = useInfiniteQuery(
    trpc.expenses.overview.infiniteQueryOptions(
      { cursor: 0 },
      {
        getNextPageParam: () => undefined,
        getPreviousPageParam: (firstPage) => firstPage.overview.previousCursor,
      },
    ),
  );
  const overviewPages = overviewQuery.data?.pages || [];
  const latestOverviewPage = overviewPages[overviewPages.length - 1];

  return (
    <div className={cn("flex flex-col h-full bg-muted pb-30 overflow-auto")}>
      <OverviewHeader
        overviewData={latestOverviewPage}
        isOverviewLoading={overviewQuery.isLoading}
      />
      <MonthlyBreakdownOverview
        overviewPages={overviewPages}
        isLoading={overviewQuery.isLoading}
        isFetchingPreviousPage={overviewQuery.isFetchingPreviousPage}
        hasPreviousPage={overviewQuery.hasPreviousPage}
        fetchPreviousPage={overviewQuery.fetchPreviousPage}
      />
      <RecentTransactionsOverview
        overviewData={latestOverviewPage}
        isLoading={overviewQuery.isLoading}
      />
      <AddTransactionFab />
    </div>
  );
}
