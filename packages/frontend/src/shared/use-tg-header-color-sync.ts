import { useTheme } from "@/pages/shared/theme-provider";
import { useEffect } from "react";
import { getWebApp } from "./telegram";
import { useRouter } from "@/shared/stacked-router/router";

export function useTgHeaderColorSync() {
  const { theme } = useTheme();
  const { currentRoute } = useRouter();

  const isPrimary =
    currentRoute?.type === "settings" ||
    currentRoute?.type === "family" ||
    currentRoute?.type === "accountForm" ||
    currentRoute?.type === "transactionForm";

  useEffect(() => {
    const webApp = getWebApp();
    if (!webApp) return;

    if (theme === "dark") {
      if (isPrimary) {
        // console.log('primary dark')
        webApp.setHeaderColor("#0a0a0a");
      } else {
        // console.log('not primary dark')
        webApp.setHeaderColor("#262626");
      }
    } else {
      if (isPrimary) {
        // console.log('primary light')
        webApp.setHeaderColor("#ffffff");
      } else {
        // console.log('not primary light')
        webApp.setHeaderColor("#f5f5f5");
      }
    }
  }, [theme, isPrimary]);
}
