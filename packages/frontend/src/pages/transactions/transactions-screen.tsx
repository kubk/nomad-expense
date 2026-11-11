import { Card, CardContent } from "@/components/ui/card";
import { TransactionItem } from "../widgets/transaction-item";
import {
  TransactionFiltersSummary,
  TransactionListSkeleton,
} from "../widgets/summary-card";
import { FiltersDrawer } from "../widgets/filters-drawer";
import { useState } from "react";
import { TransactionsScreenStore } from "./transactions-screen-store";
import { Page } from "../widgets/page";
import { type RouteByType } from "@/shared/stacked-router/router-store";
import { VList } from "virtua";
import { FilterIcon } from "lucide-react";
import { t } from "@/translations/translation-store";

export function TransactionsScreen({
  route,
}: {
  route: RouteByType<"transactions">;
}) {
  const [store] = useState(() => new TransactionsScreenStore(route.filters));
  const transactions = store.transactions;

  return (
    <Page title={t("transactionsTitle")}>
      <TransactionFiltersSummary store={store} />

      {/* Transactions List */}
      <div className="mt-4">
        <Card className="border-0 p-0 shadow-sm">
          <CardContent className="p-0">
            {store.isLoading ? (
              <TransactionListSkeleton />
            ) : transactions.length >= 6 ? (
              <VList style={{ height: 600 }}>
                {transactions.map((transaction, idx) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    borderBottom={idx !== transactions.length - 1}
                  />
                ))}
              </VList>
            ) : transactions.length > 0 ? (
              <div>
                {transactions.map((transaction, idx) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    borderBottom={idx !== transactions.length - 1}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <FilterIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {t("transactionsNoFound")}
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  {t("transactionsNoFoundDescription")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <FiltersDrawer target={store.filtersState} />
    </Page>
  );
}
