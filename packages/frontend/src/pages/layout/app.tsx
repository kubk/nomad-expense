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
import { AuthScreen } from "../auth/auth-screen";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "@/shared/stacked-router/router";
import { useCallback, useEffect } from "react";
import { Route } from "@/shared/stacked-router/routes";
import { AnimatedScreen } from "@/shared/stacked-router/animated-screen";
import { AccountPickerScreen } from "../transactions/account-picker-screen";
import { initializeTma } from "@/shared/telegram";
// import { getSafeAreaInset } from "@/shared/telegram";

export function App() {
  useEffect(initializeTma, []);
  const { navigationStack, navigate, pop } = useRouter();
  // const safeAreaInset = getSafeAreaInset();

  const renderScreen = useCallback(
    (route: Route, index: number, stack: Route[]) => {
      const props = { route } as any;

      let ScreenComponent;
      const type = route.type;
      switch (type) {
        case "main":
          ScreenComponent = <OverviewScreen {...props} />;
          break;
        case "settings":
          ScreenComponent = <SettingsScreen {...props} />;
          break;
        case "family":
          ScreenComponent = <FamilyScreen {...props} />;
          break;
        case "invite":
          ScreenComponent = <InviteScreen {...props} />;
          break;
        case "accountForm":
          ScreenComponent = <AccountFormScreen {...props} />;
          break;
        case "transactionForm":
          ScreenComponent = <TransactionFormScreen {...props} />;
          break;
        case "accountPicker":
          ScreenComponent = <AccountPickerScreen {...props} />;
          break;
        case "transactions":
          ScreenComponent = <TransactionsScreen {...props} />;
          break;
        case "monthlyBreakdownFull":
          ScreenComponent = <MonthlyBreakdownFull {...props} />;
          break;
        case "accounts":
          ScreenComponent = <AccountsScreen {...props} />;
          break;
        case "auth":
          ScreenComponent = <AuthScreen {...props} />;
          break;
        default:
          return type satisfies never;
      }

      return (
        <AnimatedScreen
          key={`${type}-${index}`}
          index={index}
          stack={stack}
          route={route}
          transition={{
            ease: "easeInOut",
            // Keep it here so I can debug animations
            // duration: 2,
          }}
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
          {ScreenComponent}
        </AnimatedScreen>
      );
    },
    [navigate, pop],
  );

  return (
    <div
      className="max-w-md mx-auto relative app-container overflow-hidden"
      style={
        {
          // paddingTop: `${safeAreaInset.top}px`,
          // paddingBottom: `${safeAreaInset.bottom}px`,
          // paddingLeft: `${safeAreaInset.left}px`,
          // paddingRight: `${safeAreaInset.right}px`,
          // paddingTop: 100,
          // paddingBottom: 100,
          // paddingLeft: 100,
          // paddingRight: 100,
        }
      }
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
