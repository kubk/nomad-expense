import { RecentTransactionsOverview } from "./recent-transactions-overview";
import { OverviewHeader } from "./overview-header";
import { MonthlyBreakdownOverview } from "./monthly-breakdown-overview";
import { Page } from "../shared/page";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { render } from "typesafe-routes";
import { routes } from "../../routes";

export function OverviewScreen() {
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
    <Page>
      <OverviewHeader />
      <MonthlyBreakdownOverview />
      <RecentTransactionsOverview />

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-23 right-4 h-14 w-14 rounded-full shadow-md"
        onClick={handleAddTransactionClick}
      >
        <PlusIcon size={48} />
      </Button>
    </Page>
  );
}
