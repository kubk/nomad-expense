import {
  CalendarIcon,
  ChartNoAxesColumnIcon,
  CreditCardIcon,
  SettingsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navigation({
  currentScreen,
  setCurrentScreen,
}: {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="flex justify-around items-center py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentScreen("overview")}
          className={`flex flex-col items-center gap-1 ${currentScreen === "overview" ? "text-indigo-600" : "text-gray-500"}`}
        >
          <ChartNoAxesColumnIcon className="w-5 h-5" />
          <span className="text-xs">Overview</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentScreen("transactions")}
          className={`flex flex-col items-center gap-1 ${currentScreen === "transactions" ? "text-indigo-600" : "text-gray-500"}`}
        >
          <CreditCardIcon className="w-5 h-5" />
          <span className="text-xs">Transactions</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentScreen("accounts")}
          className={`flex flex-col items-center gap-1 ${currentScreen === "accounts" ? "text-indigo-600" : "text-gray-500"}`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="text-xs">Accounts</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentScreen("settings")}
          className={`flex flex-col items-center gap-1 ${currentScreen === "settings" ? "text-indigo-600" : "text-gray-500"}`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-xs">Settings</span>
        </Button>
      </div>
    </div>
  );
}
