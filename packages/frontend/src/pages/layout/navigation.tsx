import {
  CalendarIcon,
  ChartNoAxesColumnIcon,
  CreditCardIcon,
  SettingsIcon,
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export function Navigation({ currentScreen }: { currentScreen: string }) {
  const navItems = [
    { route: "/overview", icon: ChartNoAxesColumnIcon, label: "Overview" },
    { route: "/transactions", icon: CreditCardIcon, label: "Transactions" },
    { route: "/accounts", icon: CalendarIcon, label: "Accounts" },
    { route: "/settings", icon: SettingsIcon, label: "Settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="flex justify-around items-center py-3">
        {navItems.map(({ route, icon: Icon, label }) => (
          <Link
            key={route}
            href={route}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
              currentScreen === route.slice(1)
                ? "text-primary bg-primary/5 font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
