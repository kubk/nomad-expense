import { Calendar, CreditCard, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
}

export const Navigation = ({
  currentScreen,
  setCurrentScreen,
}: NavigationProps) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
    <div className="flex justify-around items-center py-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCurrentScreen("overview")}
        className={`flex flex-col items-center gap-1 ${currentScreen === "overview" ? "text-indigo-600" : "text-gray-500"}`}
      >
        <TrendingDown className="w-5 h-5" />
        <span className="text-xs">Overview</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCurrentScreen("transactions")}
        className={`flex flex-col items-center gap-1 ${currentScreen === "transactions" ? "text-indigo-600" : "text-gray-500"}`}
      >
        <CreditCard className="w-5 h-5" />
        <span className="text-xs">Transactions</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCurrentScreen("accounts")}
        className={`flex flex-col items-center gap-1 ${currentScreen === "accounts" ? "text-indigo-600" : "text-gray-500"}`}
      >
        <Calendar className="w-5 h-5" />
        <span className="text-xs">Accounts</span>
      </Button>
    </div>
  </div>
);
