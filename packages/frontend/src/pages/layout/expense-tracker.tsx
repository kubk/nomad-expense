import { Router, Route, useLocation } from "wouter";
import { TransactionsScreen } from "../transactions/transactions-screen";
import { MonthlyBreakdownFull } from "../monthly-breakdown-full/monthly-breakdown-full";
import { AccountsScreen } from "../accounts/accounts-screen";
import { Navigation } from "./navigation";
import { OverviewScreen } from "../overview/overview-screen";
import { SettingsScreen } from "../settings/settings-screen";
import { api } from "@/api";

export function ExpenseTracker() {
  const [location] = useLocation();

  api.users.me.useQuery();

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
        <Route path="/" component={() => <OverviewScreen />} />

        <Route path="/transactions" component={() => <TransactionsScreen />} />

        <Route
          path="/monthly-breakdown-full"
          component={() => <MonthlyBreakdownFull />}
        />

        <Route path="/accounts" component={() => <AccountsScreen />} />

        <Route path="/settings" component={() => <SettingsScreen />} />
      </Router>

      {!hideNavigation && <Navigation currentScreen={currentRoute} />}
    </div>
  );
}
