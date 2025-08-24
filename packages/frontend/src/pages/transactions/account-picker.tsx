import { cn } from "@/lib/utils";
import { getColorById } from "../accounts/account-colors";
import { getCurrencySymbol } from "../../shared/currency-formatter";
import { SupportedCurrency } from "api";

type Account = {
  id: string;
  name: string;
  color: string;
  currency: string;
};

type AccountPickerProps = {
  accounts: Account[];
  onSelect: (accountId: string) => void;
};

export function AccountPicker({ accounts, onSelect }: AccountPickerProps) {
  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-medium">Select Account</label>
      {accounts.map((account) => {
        const colorInfo = getColorById(account.color);
        return (
          <button
            key={account.id}
            className="bg-card rounded-2xl border p-4 text-left hover:bg-muted/50 transition-colors"
            onClick={() => onSelect(account.id)}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={cn("w-12 h-12 rounded-xl", colorInfo.bg)} />
                <div
                  className={cn(
                    "absolute inset-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold",
                    colorInfo.text,
                  )}
                >
                  {getCurrencySymbol(account.currency as SupportedCurrency)}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-lg">
                  {account.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {account.currency}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
