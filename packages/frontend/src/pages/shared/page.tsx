import { cn } from "@/lib/utils";
import { PageHeader } from "./page-header";
import { ReactNode, useEffect } from "react";
import { useTheme } from "./theme-provider";
import { getWebApp } from "@/shared/telegram";

function useTelegramHeaderColorSync(bg: "primary" | "secondary") {
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

export function Page({
  children,
  className,
  title,
  bg = "primary",
}: {
  children: ReactNode;
  className?: string;
  title?: string | ReactNode;
  bg?: "primary" | "secondary";
}) {
  useTelegramHeaderColorSync(bg);

  return (
    <div
      className={cn(
        "flex flex-col h-full",
        bg === "primary" ? "bg-background" : null,
        bg === "secondary" ? "bg-muted" : null,
        className,
      )}
    >
      {title && typeof title === "string" ? <PageHeader title={title} /> : null}
      {title && typeof title !== "string" ? title : null}
      <div className="flex-1 flex flex-col px-4 overflow-auto pb-24 pt-0">
        {children}
      </div>
    </div>
  );
}
