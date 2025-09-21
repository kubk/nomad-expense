import { trpc } from "@/shared/api";
import { useQueryClient } from "@tanstack/react-query";

export function useInvalidateTransactions() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: trpc.expenses.transactionsList.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.expenses.overview.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.expenses.transactionsByMonth.queryKey(),
    });
  };
}
