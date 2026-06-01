import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, trpc } from "@/shared/api";

function getIncludedAccountIds(
  accountIds: string[],
  excludedAccountIds: string[],
) {
  const excludedAccountIdsSet = new Set(excludedAccountIds);
  return accountIds.filter(
    (accountId) => !excludedAccountIdsSet.has(accountId),
  );
}

function useMonthlyBreakdownExcludedAccountIds() {
  const queryOptions =
    trpc.family.getMonthlyBreakdownExcludedAccountIds.queryOptions();
  const { data: excludedAccountIds = [], isLoading } = useQuery(queryOptions);

  const mutation = useMutation(
    trpc.family.updateMonthlyBreakdownExcludedAccountIds.mutationOptions({
      onSuccess: (excludedAccountIds) => {
        queryClient.setQueryData(queryOptions.queryKey, excludedAccountIds);
        queryClient.invalidateQueries({
          queryKey: trpc.expenses.overview.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.expenses.transactionsByMonth.queryKey(),
        });
      },
      onError: () => {
        queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
      },
    }),
  );

  return {
    excludedAccountIds,
    isLoading,
    isSaving: mutation.isPending,
    setExcludedAccountIds: async (excludedAccountIds: string[]) => {
      await mutation.mutateAsync({ excludedAccountIds });
    },
  };
}

export function useMonthlyBreakdownAccountIds() {
  const { data: accounts = [], isLoading: isAccountsLoading } = useQuery(
    trpc.accounts.list.queryOptions(),
  );
  const {
    excludedAccountIds,
    isLoading: isExcludedAccountIdsLoading,
    isSaving,
    setExcludedAccountIds,
  } = useMonthlyBreakdownExcludedAccountIds();

  const accountIds = useMemo(
    () => accounts.map((account) => account.id),
    [accounts],
  );
  const includedAccountIds = useMemo(
    () => getIncludedAccountIds(accountIds, excludedAccountIds),
    [accountIds, excludedAccountIds],
  );

  return {
    accountIds,
    accounts,
    excludedAccountIds,
    includedAccountIds,
    isLoading: isAccountsLoading || isExcludedAccountIdsLoading,
    isSaving,
    setExcludedAccountIds,
  };
}
