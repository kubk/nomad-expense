import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/shared/stacked-router/router";
import { getSafeAreaInset } from "@/shared/platform/platform";

export function AddTransactionFab() {
  const { navigate } = useRouter();

  return (
    <Button
      className="fixed right-4 h-14 w-14 rounded-full shadow-md"
      style={{
        bottom: 92 + getSafeAreaInset().bottom,
      }}
      onClick={() => navigate({ type: "accountPicker" })}
    >
      <PlusIcon className="size-6" />
    </Button>
  );
}
