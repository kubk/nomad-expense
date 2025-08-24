import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { render } from "typesafe-routes";
import { routes } from "../../routes";

export function AddTransactionFab() {
  const [, navigate] = useLocation();

  const handleAddTransactionClick = () => {
    navigate(
      render(routes.transactionForm, {
        query: {},
        path: {},
      }),
    );
  };

  return (
    <Button
      className="fixed bottom-23 right-4 h-14 w-14 rounded-full shadow-md"
      onClick={handleAddTransactionClick}
    >
      <PlusIcon className="size-6" />
    </Button>
  );
}
