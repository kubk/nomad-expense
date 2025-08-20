import { useState } from "react";
import { accounts, monthlyData, transactions } from "./expense-tracker/data";
import { filterTransactions, calculateTotal } from "./expense-tracker/utils";
import { OverviewScreen } from "./expense-tracker/OverviewScreen";
import { TransactionsScreen } from "./expense-tracker/TransactionsScreen";
import { YearlyBreakdownScreen } from "./expense-tracker/YearlyBreakdownScreen";
import { AccountsScreen } from "./expense-tracker/AccountsScreen";
import { Navigation } from "./expense-tracker/Navigation";

const ExpenseTracker = () => {
  const [currentScreen, setCurrentScreen] = useState("overview");
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = filterTransactions(
    transactions,
    selectedAccount,
    dateRange,
  );
  const totalUSD = calculateTotal(filteredTransactions);

  return (
    <div
      className="max-w-md mx-auto bg-white shadow-2xl relative"
      style={{ height: "100vh", overflow: "auto" }}
    >
      {currentScreen === "overview" && (
        <OverviewScreen
          accounts={accounts}
          monthlyData={monthlyData}
          transactions={transactions}
          setCurrentScreen={setCurrentScreen}
          setDateRange={setDateRange}
          setSelectedAccount={setSelectedAccount}
        />
      )}

      {currentScreen === "transactions" && (
        <TransactionsScreen
          accounts={accounts}
          filteredTransactions={filteredTransactions}
          totalUSD={totalUSD}
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

      {!["yearly-breakdown"].includes(currentScreen) && (
        <Navigation
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
        />
      )}
    </div>
  );
};

export default ExpenseTracker;
