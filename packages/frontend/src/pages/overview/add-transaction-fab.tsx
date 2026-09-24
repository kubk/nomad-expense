import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/shared/stacked-router/router";
import { platform } from "@/shared/platform/platforms";
import { haptic } from "@/shared/platform/haptics";

export function AddTransactionFab() {
  const { currentRoute, navigate } = useRouter();

  if (currentRoute.type !== "main") {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 mx-auto flex w-full max-w-md justify-end px-4 pointer-events-none"
      style={{
        bottom: 92 + platform.safeAreaInset().bottom,
      }}
    >
      <Button
        className="pointer-events-auto h-14 w-14 rounded-full shadow-md"
        onClick={() => {
          haptic("light");
          navigate({ type: "transactionForm" });
        }}
      >
        <PlusIcon className="size-6" />
      </Button>
    </div>
  );
}
