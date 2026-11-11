import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routerStore } from "@/shared/stacked-router/router-store";
import { platform } from "@/shared/platform/platforms";
import { haptic } from "@/shared/platform/haptics";

export function AddTransactionFab() {
  if (routerStore.currentRoute.type !== "main") {
    return null;
  }

  return (
    <div
      className="app-shell-fixed flex justify-end px-4 pointer-events-none"
      style={{
        bottom: 92 + platform.safeAreaInset().bottom,
      }}
    >
      <Button
        className="pointer-events-auto h-14 w-14 rounded-full shadow-md"
        onClick={() => {
          haptic("light");
          routerStore.navigate({ type: "transactionForm" });
        }}
      >
        <PlusIcon className="size-6" />
      </Button>
    </div>
  );
}
