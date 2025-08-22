import { api } from "@/api";

export function useAccountIds() {
  const { data: accounts } = api.accounts.list.useQuery();

  return accounts?.map((account) => account.id) ?? [];
}
