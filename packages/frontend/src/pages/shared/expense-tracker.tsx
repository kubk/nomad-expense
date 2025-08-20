import { useState } from "react";
import { accounts, monthlyData, transactions } from "../../shared/data";
import { TransactionsScreen } from "../transactions/transactions-screen";
import { MonthlyBreakdownFull } from "../monthly-breakdown-full/monthly-breakdown-full";
import { AccountsScreen } from "../accounts/accounts-screen";
import { OverviewScreen } from "../overview/overview-screen";
import { SettingsScreen } from "../settings/settings-screen";
import { calculateTotal, filterTransactions } from "@/shared/utils";
import { Navigation } from "../layout/navigation";
import { Route } from "@/shared/types";

export function ExpenseTracker() {
  const [currentScreen, setCurrentScreen] = useState<Route>("overview");
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

      {currentScreen === "monthly-breakdown-full" && (
        <MonthlyBreakdownFull
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

      {!["monthly-breakdown-full", "settings"].includes(currentScreen) && (
        <Navigation
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
        />
      )}
    </div>
  );
}
