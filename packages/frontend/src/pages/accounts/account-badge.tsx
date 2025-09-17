import { trpc } from "@/shared/api";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { getColorById } from "./account-colors";

export function AccountBadge({ accountId }: { accountId: string }) {
  const { data: account } = useQuery({
    ...trpc.accounts.list.queryOptions(),
    select: (accounts) => accounts.find((a) => a.id === accountId),
  });

  if (!account) {
    return null;
  }

  const colorInfo = getColorById(account.color);

  return (
    <div
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        colorInfo.bg,
        colorInfo.text,
      )}
    >
      <span>{account.name}</span>
    </div>
  );
}
