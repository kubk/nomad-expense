import { useState } from "react";
import { Router, Route, useLocation } from "wouter";
import { accounts, monthlyData, transactions } from "../../shared/data";
import { TransactionsScreen } from "../transactions/transactions-screen";
import { MonthlyBreakdownFull } from "../monthly-breakdown-full/monthly-breakdown-full";
import { AccountsScreen } from "../accounts/accounts-screen";
import { Navigation } from "./navigation";
import { OverviewScreen } from "../overview/overview-screen";
import { SettingsScreen } from "../settings/settings-screen";
import { calculateTotal, filterTransactions } from "@/shared/utils";

export function ExpenseTracker() {
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [location] = useLocation();

  const filteredTransactions = filterTransactions(
    transactions,
    selectedAccount,
    dateRange,
  );
  const totalInBaseCurrency = calculateTotal(filteredTransactions);

  const currentRoute = location.slice(1) || "overview";
  const hideNavigation = ["monthly-breakdown-full", "settings"].includes(
    currentRoute,
  );

  return (
    <div
      className="max-w-md mx-auto bg-muted/100 shadow-2xl relative"
      style={{ height: "100vh", overflow: "auto" }}
    >
      <Router>
        <Route
          path="/"
          component={() => (
            <OverviewScreen
              monthlyData={monthlyData}
              transactions={transactions}
              accounts={accounts}
              setDateRange={setDateRange}
              setSelectedAccount={setSelectedAccount}
            />
          )}
        />

        <Route
          path="/overview"
          component={() => (
            <OverviewScreen
              monthlyData={monthlyData}
              transactions={transactions}
              accounts={accounts}
              setDateRange={setDateRange}
              setSelectedAccount={setSelectedAccount}
            />
          )}
        />

        <Route
          path="/transactions"
          component={() => (
            <TransactionsScreen
              accounts={accounts}
              filteredTransactions={filteredTransactions}
              totalInBaseCurrency={totalInBaseCurrency}
              selectedAccount={selectedAccount}
              dateRange={dateRange}
              showFilters={showFilters}
              setSelectedAccount={setSelectedAccount}
              setDateRange={setDateRange}
              setShowFilters={setShowFilters}
            />
          )}
        />

        <Route
          path="/monthly-breakdown-full"
          component={() => (
            <MonthlyBreakdownFull
              monthlyData={monthlyData}
              setDateRange={setDateRange}
              setSelectedAccount={setSelectedAccount}
            />
          )}
        />

        <Route
          path="/accounts"
          component={() => (
            <AccountsScreen
              accounts={accounts}
              transactions={transactions}
              setSelectedAccount={setSelectedAccount}
            />
          )}
        />

        <Route path="/settings" component={() => <SettingsScreen />} />
      </Router>

      {!hideNavigation && <Navigation currentScreen={currentRoute} />}
    </div>
  );
}
