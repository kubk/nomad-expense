import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/shared/stacked-router/router";

export function AddTransactionFab() {
  const { navigate } = useRouter();

  return (
    <Button
      className="fixed bottom-23 right-4 h-14 w-14 rounded-full shadow-md"
      onClick={() => navigate({ type: "accountPicker" })}
    >
      <PlusIcon className="size-6" />
    </Button>
  );
}
