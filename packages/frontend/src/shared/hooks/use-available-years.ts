import { api } from "@/api";

export function useAvailableYears() {
  const { data: overviewData } = api.expenses.overview.useQuery();

  return overviewData
    ? [...new Set(overviewData.data.map((m) => m.year))].sort((a, b) => b - a)
    : [];
}
