import { useTheme } from "@/pages/shared/theme-provider";
import { useEffect } from "react";
import { getWebApp } from "./telegram";

export function useTgHeaderColorSync(bg: "primary" | "secondary") {
  const { theme } = useTheme();
  useEffect(() => {
    const webApp = getWebApp();
    if (!webApp) return;
    if (theme === "dark") {
      if (bg === "primary") {
        webApp.setHeaderColor("#0a0a0a");
      } else {
        webApp.setHeaderColor("#262626");
      }
    } else {
      if (bg === "primary") {
        webApp.setHeaderColor("#ffffff");
      } else {
        webApp.setHeaderColor("#f5f5f5");
      }
    }
  }, [bg, theme]);
}
