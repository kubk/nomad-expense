import { Router, Route, Switch } from "wouter";
import { template } from "typesafe-routes";
import { routes } from "../../shared/routes";
import { TransactionsScreen } from "../transactions/transactions-screen";
import { MonthlyBreakdownFull } from "../monthly-breakdown-full/monthly-breakdown-full";
import { AccountsScreen } from "../accounts/accounts-screen";
import { AccountFormScreen } from "../accounts/account-form-screen";
import { TransactionFormScreen } from "../transactions/transaction-form-screen";
import { Navigation } from "./navigation";
import { OverviewScreen } from "../overview/overview-screen";
import { SettingsScreen } from "../settings/settings-screen";
import { FamilyScreen } from "../settings/family-screen";
import { InviteScreen } from "../invite/invite-screen";
import { api } from "@/shared/api";

export function App() {
  api.users.me.useQuery();
  api.accounts.listWithStats.useQuery();

  return (
    <div className="max-w-md mx-auto bg-muted/100 relative h-screen overflow-auto">
      <Router>
        <Switch>
          <Route path={template(routes.overview)}>
            <OverviewScreen />
          </Route>

          <Route path={template(routes.transactions)}>
            <TransactionsScreen />
          </Route>

          <Route path={template(routes.monthlyBreakdownFull)}>
            <MonthlyBreakdownFull />
          </Route>

          <Route path={template(routes.accounts)}>
            <AccountsScreen />
          </Route>

          <Route path={template(routes.accountForm)}>
            <AccountFormScreen />
          </Route>

          <Route path={template(routes.transactionForm)}>
            <TransactionFormScreen />
          </Route>

          <Route path={template(routes.settings)}>
            <SettingsScreen />
          </Route>

          <Route path={template(routes.family)}>
            <FamilyScreen />
          </Route>

          <Route path={template(routes.invite)}>
            <InviteScreen />
          </Route>
        </Switch>
      </Router>

      <Navigation />
    </div>
  );
}
