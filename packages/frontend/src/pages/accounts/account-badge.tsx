import { accountsStore } from "@/store/accounts-store";
import { cn } from "@/lib/utils";
import { getColorById } from "./account-colors";

export function AccountBadge({ accountId }: { accountId: string }) {
  const account = accountsStore.findAccount(accountId);

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
