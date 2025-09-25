import { useTheme } from "@/pages/widgets/theme-provider";
import { useEffect } from "react";
import { getWebApp } from "./telegram";
import { useRouter } from "@/shared/stacked-router/router";
import { isFormRoute } from "@/shared/stacked-router/routes";

export function useTgHeaderColorSync() {
  const { theme } = useTheme();
  const { currentRoute } = useRouter();
  const isForm = isFormRoute(currentRoute);

  useEffect(() => {
    const webApp = getWebApp();
    if (!webApp) return;

    if (theme === "dark") {
      if (isForm) {
        webApp.setHeaderColor("#0a0a0a");
      } else {
        webApp.setHeaderColor("#262626");
      }
    } else {
      if (isForm) {
        webApp.setHeaderColor("#ffffff");
      } else {
        webApp.setHeaderColor("#f5f5f5");
      }
    }
  }, [theme, isForm]);
}
