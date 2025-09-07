import { PlusIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrencySymbol } from "../../shared/currency-formatter";
import { PageHeader } from "../shared/page-header";
import { trpc } from "@/shared/api";
import { useQuery } from "@tanstack/react-query";
import { Page } from "../shared/page";
import { SupportedCurrency } from "api";
import { getColorById } from "./account-colors";
import { cn } from "@/lib/utils";
import { DateTime } from "luxon";
import { useRouter } from "@/shared/stacked-router/router";

export function AccountsScreen() {
  const { navigate } = useRouter();
  const { data: accounts = [], isLoading } = useQuery(
    trpc.accounts.listWithStats.queryOptions(),
  );

  const handleAccountClick = (accountId: string) => {
    navigate({ type: "accountForm", accountId });
  };

  const handleAddAccountClick = () => {
    navigate({ type: "accountForm" });
  };

  return (
    <Page
      bg="secondary"
      title={
        <PageHeader
          title="Accounts"
          rightSlot={
            <Button variant="ghost" size="sm" onClick={handleAddAccountClick}>
              <PlusIcon className="w-4 h-4" />
            </Button>
          }
        />
      }
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {accounts.map((account) => {
            const colorInfo = getColorById(account.color);
            return (
              <button
                key={account.id}
                className="w-full bg-card rounded-2xl shadow-sm transition-colors text-left active:scale-95 transition-transform"
                onClick={() => handleAccountClick(account.id)}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div
                        className={cn("w-12 h-12 rounded-xl", colorInfo.bg)}
                      />
                      <div
                        className={cn(
                          "absolute inset-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold",
                          colorInfo.text,
                        )}
                      >
                        {getCurrencySymbol(
                          account.currency as SupportedCurrency,
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg">
                        {account.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                        <span>{account.transactionCount} transactions</span>
                        {account.lastTransactionDate && (
                          <>
                            <span>·</span>
                            <span>
                              Last:{" "}
                              {DateTime.fromISO(
                                account.lastTransactionDate,
                              ).toLocaleString(DateTime.DATE_SHORT)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Page>
  );
}
