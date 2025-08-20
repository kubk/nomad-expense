import { Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Account, Transaction, DateRange } from "./types";
import { TransactionItem } from "./transaction-item";
import { useCurrency } from "./currency-context";
import { SupportedCurrency } from "./currency-service";

interface TransactionsScreenProps {
  accounts: Account[];
  filteredTransactions: Transaction[];
  totalInBaseCurrency: number;
  selectedAccount: string;
  dateRange: DateRange;
  showFilters: boolean;
  setCurrentScreen: (screen: string) => void;
  setSelectedAccount: (account: string) => void;
  setDateRange: (range: DateRange) => void;
  setShowFilters: (show: boolean) => void;
}

export const TransactionsScreen = ({
  accounts,
  filteredTransactions,
  totalInBaseCurrency,
  selectedAccount,
  dateRange,
  showFilters,
  setCurrentScreen,
  setSelectedAccount,
  setDateRange,
  setShowFilters,
}: TransactionsScreenProps) => {
  const { baseCurrency, formatAmount, getCurrencySymbol } = useCurrency();

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
            ← Back
          </Button>
          <h1 className="font-semibold text-gray-900">Transactions</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-indigo-50" : ""}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="px-4 pb-4 border-t">
            <div className="space-y-3 mt-4">
              <div>
                <Label className="text-xs text-gray-600">Account</Label>
                <Select
                  value={selectedAccount}
                  onValueChange={setSelectedAccount}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full ${acc.color} mr-2`}
                          />
                          {acc.name} (
                          {getCurrencySymbol(acc.currency as SupportedCurrency)}
                          )
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-600">From</Label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={dateRange.from}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, from: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">To</Label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={dateRange.to}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, to: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedAccount("all");
                    setDateRange({ from: "", to: "" });
                  }}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="flex-1 bg-indigo-600"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
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
              {formatAmount(totalInBaseCurrency, baseCurrency)}
            </p>
            <p className="text-indigo-100 text-xs mt-2">
              {filteredTransactions.length} transactions (converted to{" "}
              {baseCurrency})
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
};
