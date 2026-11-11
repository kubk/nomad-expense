import { makeAutoObservable } from "mobx";
import { makeInfiniteQuery, makeQuery } from "mobx-query-lite";
import { api, apiProxy } from "@/shared/api";

class OverviewStore {
  // The latest page also carries the 30-day total and the recent transactions
  overviewQuery = makeQuery(apiProxy.expenses.overview.query({ cursor: 0 }));

  // Months before the latest page, newest first. Cursor 0 is the latest page above, so older pages start at 1
  olderMonthsQuery = makeInfiniteQuery({
    key: ["expenses", "overview", "older"],
    query: async ({ cursor }) => {
      const page = await api.expenses.overview.query({ cursor: cursor ?? 1 });
      return {
        items: [...page.overview.data].reverse(),
        nextCursor: page.overview.previousCursor ?? null,
      };
    },
  });

  // Older months are only fetched once the user scrolls the chart back
  isOlderMonthsRequested = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get overview() {
    return this.overviewQuery.data;
  }

  get isLoading() {
    return this.overviewQuery.isPending;
  }

  get months() {
    const latestMonths = this.overview?.overview.data ?? [];
    if (!this.isOlderMonthsRequested) {
      return latestMonths;
    }
    return [...this.olderMonthsQuery.items].reverse().concat(latestMonths);
  }

  get hasOlderMonths() {
    if (!this.isOlderMonthsRequested) {
      return this.overview?.overview.previousCursor !== undefined;
    }
    return this.olderMonthsQuery.hasNextPage;
  }

  get isFetchingOlderMonths() {
    return (
      this.isOlderMonthsRequested &&
      (this.olderMonthsQuery.isPending ||
        this.olderMonthsQuery.isFetchingNextPage)
    );
  }

  loadOlderMonths() {
    if (!this.hasOlderMonths || this.isFetchingOlderMonths) {
      return;
    }
    if (!this.isOlderMonthsRequested) {
      this.isOlderMonthsRequested = true;
      return;
    }
    this.olderMonthsQuery.fetchNextPage();
  }
}

export const overviewStore = new OverviewStore();
