import { trpc } from "@/shared/api";
import { useQuery } from "@tanstack/react-query";

export function useAvailableYears(accounts: string[]) {
  const { data: availableYears } = useQuery(
    trpc.expenses.availableYears.queryOptions({ accounts }),
  );

  return availableYears ?? [];
}
