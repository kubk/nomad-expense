import { CheckIcon, ChevronDownIcon } from "lucide-react";
import type { Account } from "api";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { getCurrencySymbol } from "@/shared/currency-formatter";
import { haptic } from "@/shared/platform/haptics";
import { useTranslation } from "@/translations/translation-provider";
import { getColorById } from "../accounts/account-colors";
import { useState } from "react";

export function AccountPickerDrawer({
  accounts,
  selectedAccount,
  onSelect,
  className,
}: {
  accounts: Account[];
  selectedAccount: Account;
  onSelect: (accountId: string) => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const selectedColor = getColorById(selectedAccount.color);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-11 min-w-0 items-center gap-2 rounded-full bg-muted/70 px-3 text-sm font-medium active:scale-95 transition-transform",
            className,
          )}
          onClick={() => haptic("selection")}
        >
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg font-semibold",
              selectedColor.bg,
              selectedColor.text,
            )}
          >
            {getCurrencySymbol(selectedAccount.currency)}
          </span>
          <span className="truncate">{selectedAccount.name}</span>
          <span className="shrink-0 text-muted-foreground">
            {selectedAccount.currency}
          </span>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader className="pb-2 text-left">
          <DrawerTitle>{t("accountsSelectTitle")}</DrawerTitle>
          <DrawerDescription />
        </DrawerHeader>

        <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto px-4 pb-4">
          {accounts.map((account) => {
            const color = getColorById(account.color);
            const isSelected = account.id === selectedAccount.id;

            return (
              <button
                key={account.id}
                type="button"
                className={cn(
                  "flex min-h-18 w-full items-center gap-4 rounded-2xl border bg-card p-3 text-left active:scale-[0.98] transition-transform",
                  isSelected && "border-primary",
                )}
                onClick={() => {
                  haptic("selection");
                  onSelect(account.id);
                  setIsOpen(false);
                }}
              >
                <span
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
                    color.bg,
                    color.text,
                  )}
                >
                  {getCurrencySymbol(account.currency)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-semibold">
                    {account.name}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {account.currency}
                  </span>
                </span>
                {isSelected ? (
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <CheckIcon className="size-3.5" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
