import { trpc } from "@/shared/api";
import { useQuery } from "@tanstack/react-query";

export function useAvailableYears() {
  const { data: overviewData } = useQuery(
    trpc.expenses.overview.queryOptions(),
  );

  return overviewData
    ? [...new Set(overviewData.overview.data.map((m) => m.year))].sort(
        (a, b) => b - a,
      )
    : [];
}
