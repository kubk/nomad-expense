import { PlusIcon, ChevronRightIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Transaction } from "../../shared/types";
import { currencyStore } from "../../store/currency-store";
import {
  convert,
  getCurrencySymbol,
  SupportedCurrency,
} from "../../shared/currency-converter";
import { PageHeader } from "../shared/page-header";
import { accounts } from "@/shared/data";

export function AccountsScreen({
  transactions,
  setSelectedAccount,
}: {
  transactions: Transaction[];
  setSelectedAccount: (account: string) => void;
}) {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        title="Accounts"
        rightSlot={
          <Button variant="ghost" size="sm">
            <PlusIcon className="w-4 h-4" />
          </Button>
        }
      />

      <div className="px-4 mt-4">
        <div className="space-y-3">
          {accounts.map((account) => {
            const accountTransactions = transactions.filter(
              (t) => t.account === account.id,
            );

            return (
              <Card
                key={account.id}
                className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedAccount(account.id);
                  setLocation("/transactions");
                }}
              >
                <CardContent className="px-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full ${account.color} opacity-10`}
                      />
                      <div
                        className={`w-3 h-3 rounded-full ${account.color} absolute ml-3.5`}
                      />
                      <div>
                        <p className="font-medium text-foreground">
                          {account.name}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {getCurrencySymbol(
                            account.currency as SupportedCurrency,
                          )}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      {accountTransactions.length} transactions
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last: {accountTransactions[0]?.date || "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add Account Button */}
      <div className="px-4 mt-6">
        <Button className="w-full" size="lg">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add New Account
        </Button>
      </div>
    </div>
  );
}
