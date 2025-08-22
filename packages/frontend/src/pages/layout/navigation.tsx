import {
  CalendarIcon,
  ChartNoAxesColumnIcon,
  CreditCardIcon,
  SettingsIcon,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { template } from "typesafe-routes";
import { routes } from "../../routes";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  if (
    location === template(routes.monthlyBreakdownFull) ||
    location === template(routes.settings)
  ) {
    return null;
  }

  const navItems = [
    {
      routeKey: "overview",
      route: routes.overview,
      icon: ChartNoAxesColumnIcon,
      label: "Overview",
    },
    {
      routeKey: "transactions",
      route: routes.transactions,
      icon: CreditCardIcon,
      label: "Transactions",
    },
    {
      routeKey: "accounts",
      route: routes.accounts,
      icon: CalendarIcon,
      label: "Accounts",
    },
    {
      routeKey: "settings",
      route: routes.settings,
      icon: SettingsIcon,
      label: "Settings",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="flex justify-around items-center py-3">
        {navItems.map(({ routeKey, route, icon: Icon, label }) => {
          const path = template(route);
          const isActive = location === path;
          return (
            <Link
              key={routeKey}
              href={path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "text-primary bg-primary/5 font-semibold"
                  : "text-muted-foreground",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
