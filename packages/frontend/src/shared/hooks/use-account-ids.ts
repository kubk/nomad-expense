import { api } from "@/shared/api";

export function useAccountIds() {
  const { data: accounts } = api.accounts.list.useQuery();

  return accounts?.map((account) => account.id) ?? [];
}
