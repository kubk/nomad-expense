import { api } from "@/shared/api";

export function useAvailableYears() {
  const { data: overviewData } = api.expenses.overview.useQuery();

  return overviewData
    ? [...new Set(overviewData.overview.data.map((m) => m.year))].sort(
        (a, b) => b - a,
      )
    : [];
}
