import { PlusIcon, ArrowRight, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { render } from "typesafe-routes";
import { routes } from "../../routes";
import { getCurrencySymbol } from "../../shared/currency-converter";
import { PageHeader } from "../shared/page-header";
import { api } from "@/api";
import { Page } from "../shared/page";
import { SupportedCurrency } from "api";
import { getColorById } from "./account-colors";

export function AccountsScreen() {
  const [, navigate] = useLocation();
  const { data: accounts = [], isLoading } =
    api.accounts.listWithStats.useQuery();

  const handleTransactionsClick = (accountId: string) => {
    navigate(
      render(routes.transactions, {
        query: {
          filters: {
            accounts: [accountId],
            date: { type: "months", value: 3 },
          },
        },
        path: {},
      }),
    );
  };

  const handleEditClick = (accountId: string) => {
    navigate(
      render(routes.accountForm, {
        query: { accountId },
        path: {},
      }),
    );
  };

  const handleAddAccountClick = () => {
    navigate(
      render(routes.accountForm, {
        query: {},
        path: {},
      }),
    );
  };

  return (
    <Page>
      <PageHeader
        title="Accounts"
        rightSlot={
          <Button variant="ghost" size="sm" onClick={handleAddAccountClick}>
            <PlusIcon className="w-4 h-4" />
          </Button>
        }
      />

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {accounts.map((account) => {
              const colorInfo = getColorById(account.color);
              return (
                <div key={account.id} className="bg-card rounded-2xl shadow-sm">
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div
                          className={`w-12 h-12 rounded-xl ${colorInfo.bg}`}
                        />
                        <div
                          className={`absolute ${colorInfo.text} inset-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold`}
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
                          <span>·</span>
                          <span>
                            Last: {account.lastTransactionDate || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex border-t border-border">
                    <button
                      className="flex-1 py-4 text-sm font-medium text-foreground hover:bg-muted active:bg-muted/80 transition-colors flex items-center justify-center gap-2"
                      onClick={() => handleEditClick(account.id)}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <div className="w-px bg-border" />
                    <button
                      className="flex-1 py-4 text-sm font-medium text-foreground hover:bg-muted active:bg-muted/80 transition-colors flex items-center justify-center gap-2"
                      onClick={() => handleTransactionsClick(account.id)}
                    >
                      Transactions
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add Account Button */}
            <div className="mt-6">
              <Button
                className="w-full"
                size="lg"
                onClick={handleAddAccountClick}
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add New Account
              </Button>
            </div>
          </>
        )}
      </div>
    </Page>
  );
}
