import { useState } from "react";
import { accounts, monthlyData, transactions } from "./expense-tracker/data";
import { filterTransactions, calculateTotal } from "./expense-tracker/utils";
import { OverviewScreen } from "./expense-tracker/overview-screen";
import { TransactionsScreen } from "./expense-tracker/transactions-screen";
import { YearlyBreakdownScreen } from "./expense-tracker/yearly-breakdown-screen";
import { AccountsScreen } from "./expense-tracker/accounts-screen";
import { SettingsScreen } from "./expense-tracker/settings-screen";
import { Navigation } from "./expense-tracker/navigation";
import { CurrencyProvider } from "./expense-tracker/currency-context";

const ExpenseTrackerContent = () => {
  const [currentScreen, setCurrentScreen] = useState("overview");
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = filterTransactions(
    transactions,
    selectedAccount,
    dateRange,
  );
  const totalInBaseCurrency = calculateTotal(filteredTransactions);

  return (
    <div
      className="max-w-md mx-auto bg-white shadow-2xl relative"
      style={{ height: "100vh", overflow: "auto" }}
    >
      {currentScreen === "overview" && (
        <OverviewScreen
          monthlyData={monthlyData}
          transactions={transactions}
          accounts={accounts}
          setCurrentScreen={setCurrentScreen}
          setDateRange={setDateRange}
          setSelectedAccount={setSelectedAccount}
        />
      )}

      {currentScreen === "transactions" && (
        <TransactionsScreen
          accounts={accounts}
          filteredTransactions={filteredTransactions}
          totalInBaseCurrency={totalInBaseCurrency}
          selectedAccount={selectedAccount}
          dateRange={dateRange}
          showFilters={showFilters}
          setCurrentScreen={setCurrentScreen}
          setSelectedAccount={setSelectedAccount}
          setDateRange={setDateRange}
          setShowFilters={setShowFilters}
        />
      )}

      {currentScreen === "yearly-breakdown" && (
        <YearlyBreakdownScreen
          monthlyData={monthlyData}
          setCurrentScreen={setCurrentScreen}
          setDateRange={setDateRange}
          setSelectedAccount={setSelectedAccount}
        />
      )}

      {currentScreen === "accounts" && (
        <AccountsScreen
          accounts={accounts}
          transactions={transactions}
          setCurrentScreen={setCurrentScreen}
          setSelectedAccount={setSelectedAccount}
        />
      )}

      {currentScreen === "settings" && (
        <SettingsScreen setCurrentScreen={setCurrentScreen} />
      )}

      {!["yearly-breakdown", "settings"].includes(currentScreen) && (
        <Navigation
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
        />
      )}
    </div>
  );
};

export function ExpenseTracker() {
  return (
    <CurrencyProvider>
      <ExpenseTrackerContent />
    </CurrencyProvider>
  );
}
