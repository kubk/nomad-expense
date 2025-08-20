import { FilterIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Account, Transaction, DateRange } from "../../shared/types";
import { TransactionItem } from "../shared/transaction-item";
import { useCurrency } from "../../shared/currency-context";
import { currencyService } from "../../shared/currency-service";
import { TransactionFilters } from "./transaction-filters";
import { BackButton } from "../../shared/back-button";

export function TransactionsScreen({
  accounts,
  filteredTransactions,
  totalInBaseCurrency,
  selectedAccount,
  dateRange,
  showFilters,
  setSelectedAccount,
  setDateRange,
  setShowFilters,
}: {
  accounts: Account[];
  filteredTransactions: Transaction[];
  totalInBaseCurrency: number;
  selectedAccount: string;
  dateRange: DateRange;
  showFilters: boolean;
  setSelectedAccount: (account: string) => void;
  setDateRange: (range: DateRange) => void;
  setShowFilters: (show: boolean) => void;
}) {
  const { baseCurrency } = useCurrency();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <BackButton />
          <h1 className="font-semibold text-gray-900">Transactions</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-indigo-50" : ""}
          >
            <FilterIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <TransactionFilters
            accounts={accounts}
            selectedAccount={selectedAccount}
            dateRange={dateRange}
            setSelectedAccount={setSelectedAccount}
            setDateRange={setDateRange}
            setShowFilters={setShowFilters}
          />
        )}
      </div>

      {/* Summary Card */}
      <div className="px-4 mt-4">
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
          <CardContent className="px-4">
            <p className="text-indigo-100 text-sm">
              {selectedAccount === "all"
                ? "All Accounts"
                : accounts.find((a) => a.id === selectedAccount)?.name}
            </p>
            <p className="text-2xl font-bold mt-1">
              {currencyService.formatAmount(totalInBaseCurrency, baseCurrency)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <div className="px-4 mt-4">
        <Card className="border-0 p-0 shadow-sm">
          <CardContent className="p-0">
            {filteredTransactions.map((transaction, idx) => {
              const account = accounts.find(
                (a) => a.id === transaction.account,
              );
              return (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  account={account}
                  showBorder={idx !== filteredTransactions.length - 1}
                />
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
