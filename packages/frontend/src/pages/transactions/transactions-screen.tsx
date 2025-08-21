import { FilterIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionItem } from "../shared/transaction-item";
import { currencyStore } from "../../store/currency-store";
import { formatAmount } from "../../shared/currency-converter";
import { TransactionFilters } from "./transaction-filters";
import { PageHeader } from "../shared/page-header";
import { expenseStore } from "@/store/expense-store";
import { useState } from "react";

export function TransactionsScreen() {
  const [showFilters, setShowFilters] = useState(false);
  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        title="Transactions"
        rightSlot={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-muted" : ""}
          >
            <FilterIcon className="w-4 h-4" />
          </Button>
        }
      />

      {/* Filters */}
      {showFilters && (
        <div className="bg-background border-b">
          <TransactionFilters
            accounts={expenseStore.accounts}
            selectedAccount={expenseStore.selectedAccount}
            dateRange={expenseStore.dateRange}
            setSelectedAccount={expenseStore.setSelectedAccount}
            setDateRange={expenseStore.setDateRange}
            setShowFilters={setShowFilters}
          />
        </div>
      )}

      {/* Summary Card */}
      <div className="px-4 mt-4">
        <Card className="bg-primary text-primary-foreground border-0">
          <CardContent className="px-4">
            <p className="text-primary-foreground/70 text-sm">
              {expenseStore.selectedAccount === "all"
                ? "All Accounts"
                : expenseStore.accounts.find(
                    (a) => a.id === expenseStore.selectedAccount,
                  )?.name}
            </p>
            <p className="text-2xl font-bold mt-1">
              {formatAmount(
                expenseStore.totalInBaseCurrency,
                currencyStore.baseCurrency,
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <div className="px-4 mt-4">
        <Card className="border-0 p-0 shadow-sm">
          <CardContent className="p-0">
            {expenseStore.filteredTransactions.map((transaction, idx) => {
              const account = expenseStore.accounts.find(
                (a) => a.id === transaction.account,
              );
              return (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  account={account}
                  showBorder={
                    idx !== expenseStore.filteredTransactions.length - 1
                  }
                />
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
