import {
  ChartNoAxesColumnIcon,
  ListPlusIcon,
  SettingsIcon,
  WalletIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "@/shared/stacked-router/router";
import { Route } from "@/shared/stacked-router/routes";
import { getSafeAreaInset } from "@/shared/telegram";

export function Navigation() {
  const { currentRoute, navigate } = useRouter();
  const safeAreaInset = getSafeAreaInset();

  const shouldHide =
    currentRoute.type === "monthlyBreakdownFull" ||
    currentRoute.type === "transactionForm" ||
    currentRoute.type === "accountPicker" ||
    currentRoute.type === "accountForm" ||
    currentRoute.type === "auth" ||
    currentRoute.type === "invite";

  const navItems: Array<{
    routeKey: string;
    route: Route;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }> = [
    {
      routeKey: "overview",
      route: { type: "main" },
      icon: ChartNoAxesColumnIcon,
      label: "Overview",
    },
    {
      routeKey: "transactions",
      route: { type: "transactions" },
      icon: ListPlusIcon,
      label: "Transactions",
    },
    {
      routeKey: "accounts",
      route: { type: "accounts" },
      icon: WalletIcon,
      label: "Accounts",
    },
    {
      routeKey: "settings",
      route: { type: "settings" },
      icon: SettingsIcon,
      label: "Settings",
    },
  ];

  return (
    <AnimatePresence initial={false}>
      {!shouldHide && (
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{
            ease: "easeInOut",
            // Keep it here so I can debug animations
            // duration: 2,
          }}
          style={{
            paddingBottom: safeAreaInset.bottom,
          }}
          className="fixed bottom-0 left-0 right-0 bg-background border-t border-border"
        >
          <div className="flex justify-around items-center py-3">
            {navItems.map(({ routeKey, route, icon: Icon, label }) => {
              const isActive = route.type === currentRoute.type;
              return (
                <button
                  key={routeKey}
                  onClick={() => navigate(route)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "text-primary bg-primary/5 font-semibold"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
