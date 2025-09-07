import { trpc } from "@/shared/api";
import { useQuery } from "@tanstack/react-query";

export function useAccountIds() {
  const { data: accounts } = useQuery(trpc.accounts.list.queryOptions());

  return accounts?.map((account) => account.id) ?? [];
}
