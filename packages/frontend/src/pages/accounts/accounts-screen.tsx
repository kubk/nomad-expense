import { ArrowLeftIcon, PlusIcon, ChevronRightIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Account, Transaction } from "../../shared/types";
import { useCurrency } from "../../shared/currency-context";
import {
  currencyService,
  SupportedCurrency,
} from "../../shared/currency-service";

export function AccountsScreen({
  accounts,
  transactions,
  setCurrentScreen,
  setSelectedAccount,
}: {
  accounts: Account[];
  transactions: Transaction[];
  setCurrentScreen: (screen: string) => void;
  setSelectedAccount: (account: string) => void;
}) {
  const { baseCurrency } = useCurrency();

  // Calculate total in base currency
  const totalInBaseCurrency = transactions.reduce((sum, t) => {
    const convertedAmount = currencyService.convert(t.usd, "USD", baseCurrency);
    return sum + convertedAmount;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentScreen("overview")}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h1 className="font-semibold text-gray-900">Accounts</h1>
          <Button variant="ghost" size="sm">
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Total in Base Currency */}
      <div className="px-4 mt-4">
        <Card className="bg-gray-900 text-white border-0">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm">
              Total Expenses (All Accounts)
            </p>
            <p className="text-3xl font-bold mt-1">
              {currencyService.formatAmount(totalInBaseCurrency, baseCurrency)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List */}
      <div className="px-4 mt-4">
        <h2 className="font-semibold text-gray-900 mb-3">
          {accounts.length} Accounts
        </h2>
        <div className="space-y-3">
          {accounts.map((account) => {
            const accountTransactions = transactions.filter(
              (t) => t.account === account.id,
            );
            const accountTotal = accountTransactions.reduce((sum, t) => {
              const convertedAmount = currencyService.convert(
                t.usd,
                "USD",
                baseCurrency,
              );
              return sum + convertedAmount;
            }, 0);

            return (
              <Card
                key={account.id}
                className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedAccount(account.id);
                  setCurrentScreen("transactions");
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full ${account.color} opacity-10`}
                      />
                      <div
                        className={`w-3 h-3 rounded-full ${account.color} absolute ml-3.5`}
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {account.name}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {currencyService.getCurrencySymbol(
                            account.currency as SupportedCurrency,
                          )}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t">
                    <div>
                      <p className="text-xs text-gray-500">This month</p>
                      <p className="font-semibold text-lg">
                        {currencyService.formatAmount(
                          accountTotal,
                          baseCurrency,
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {accountTransactions.length} transactions
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Last: {accountTransactions[0]?.date || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add Account Button */}
      <div className="px-4 mt-6">
        <Button className="w-full bg-indigo-600" size="lg">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add New Account
        </Button>
      </div>
    </div>
  );
}
