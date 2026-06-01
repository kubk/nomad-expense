import { trpc, queryClient } from "@/shared/api";

export function useInvalidateTransactions() {
  return () => {
    queryClient.invalidateQueries({
      queryKey: trpc.expenses.transactionsList.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.expenses.overview.pathKey(),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.expenses.transactionsByMonth.queryKey(),
    });
  };
}
