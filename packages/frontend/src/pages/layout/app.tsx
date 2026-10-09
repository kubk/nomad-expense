import { TransactionsScreen } from "../transactions/transactions-screen";
import { MonthlyBreakdownFull } from "../monthly-breakdown-full/monthly-breakdown-full";
import { MonthlyBreakdownAccountsScreen } from "../monthly-breakdown-full/monthly-breakdown-accounts-screen";
import { MonthlyBreakdownSettingsScreen } from "../monthly-breakdown-full/monthly-breakdown-settings-screen";
import { AccountsScreen } from "../accounts/accounts-screen";
import { AccountFormScreen } from "../accounts/account-form-screen";
import { ImportSettingsScreen } from "../accounts/import-settings-screen";
import { TransactionFormScreen } from "../transactions/transaction-form-screen";
import { Navigation } from "./navigation";
import { OverviewScreen } from "../overview/overview-screen";
import { SettingsScreen } from "../settings/settings-screen";
import { FamilyScreen } from "../settings/family-screen";
import { InviteScreen } from "../invite/invite-screen";
import { AuthScreen } from "../auth/auth-screen";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "@/shared/stacked-router/router";
import { useEffect, type ReactNode } from "react";
import { isFormRoute, Route } from "@/shared/stacked-router/routes";
import { AnimatedScreen } from "@/shared/stacked-router/animated-screen";
import { StatementUploadResultScreen } from "../transactions/statement-upload-result-screen";
import { useHeaderColorSync } from "@/shared/platform/use-header-color-sync";
import { getAuthToken } from "@/shared/auth-token";
import { cn } from "@/lib/utils";

export function App() {
  const { navigationStack, navigate, currentRoute } = useRouter();
  const isForm = isFormRoute(currentRoute);
  useHeaderColorSync(isForm);

  useEffect(() => {
    if (!getAuthToken()) {
      navigate({ type: "auth" });
    }
  }, [navigate]);

  const renderRouteContent = (route: Route): ReactNode => {
    switch (route.type) {
      case "main":
        return <OverviewScreen />;
      case "settings":
        return <SettingsScreen route={route} />;
      case "family":
        return <FamilyScreen route={route} />;
      case "invite":
        return <InviteScreen route={route} />;
      case "accountForm":
        return <AccountFormScreen route={route} />;
      case "importSettings":
        return <ImportSettingsScreen route={route} />;
      case "transactionForm":
        return <TransactionFormScreen route={route} />;
      case "transactions":
        return <TransactionsScreen route={route} />;
      case "monthlyBreakdownFull":
        return <MonthlyBreakdownFull route={route} />;
      case "monthlyBreakdownSettings":
        return <MonthlyBreakdownSettingsScreen route={route} />;
      case "monthlyBreakdownAccounts":
        return <MonthlyBreakdownAccountsScreen route={route} />;
      case "accounts":
        return <AccountsScreen route={route} />;
      case "auth":
        return <AuthScreen />;
      case "statementUploadResult":
        return <StatementUploadResultScreen route={route} />;
      default:
        return route satisfies never;
    }
  };

  const renderScreen = (route: Route, index: number, stack: Route[]) => (
    <AnimatedScreen
      key={`${route.type}-${index}`}
      index={index}
      stack={stack}
      route={route}
      transition={{ ease: "easeInOut" }}
      getAnimationConfig={(routeType) => {
        if (
          routeType === "settings" ||
          routeType === "main" ||
          routeType === "accounts" ||
          routeType === "transactions"
        ) {
          return "scale";
        }
        return "horizontal-slide";
      }}
    >
      {renderRouteContent(route)}
    </AnimatedScreen>
  );

  return (
    <div
      className={cn(
        "app-shell relative app-container overflow-hidden",
        isForm ? "bg-background" : "bg-muted",
      )}
    >
      <AnimatePresence initial={false} mode="sync">
        {navigationStack.map((route, index) =>
          renderScreen(route, index, navigationStack),
        )}
      </AnimatePresence>

      <Navigation />
    </div>
  );
}
