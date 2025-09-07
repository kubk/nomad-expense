import { PlusIcon, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/shared/stacked-router/router";

export function NoAccountsEmptyState() {
  const { navigate } = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-1.5">
        <Wallet className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-md font-semibold text-foreground">No accounts</h3>
      <p className="text-xs text-muted-foreground text-center mt-1">
        Please create your first account to get started
      </p>
      <Button
        className="mt-5"
        onClick={() => navigate({ type: "accountForm" }, { replace: true })}
      >
        <PlusIcon className="w-4 h-4" />
        Create account
      </Button>
    </div>
  );
}
