import { useState, type KeyboardEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Checkbox } from "@/components/ui/checkbox";
import { getCurrencySymbol } from "@/shared/currency-formatter";
import { t } from "@/translations/translation-store";
import { cn } from "@/lib/utils";
import { Footer } from "../widgets/footer";
import { NoAccountsEmptyState } from "../widgets/no-accounts-empty-state";
import { Page } from "../widgets/page";
import { getColorById } from "../accounts/account-colors";
import { accountsStore } from "@/store/accounts-store";
import { monthlyBreakdownStore } from "@/store/monthly-breakdown-store";
import { MonthlyBreakdownAccountsStore } from "./monthly-breakdown-accounts-store";

export function MonthlyBreakdownAccountsScreen() {
  // Remount when the saved selection loads or changes, so the draft starts from it
  return (
    <MonthlyBreakdownAccountsContent
      key={JSON.stringify(monthlyBreakdownStore.excludedAccountIds)}
    />
  );
}

function MonthlyBreakdownAccountsContent() {
  const [store] = useState(() => new MonthlyBreakdownAccountsStore());
  const accounts = accountsStore.accounts;
  const isLoading = monthlyBreakdownStore.isLoading;

  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    accountId: string,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    store.toggleAccount(accountId);
  };

  return (
    <Page title={t("monthlyBreakdownAccountsTitle")}>
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="mt-[35%]">
          <NoAccountsEmptyState />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {accounts.map((account) => {
            const colorInfo = getColorById(account.color);
            const isIncluded = store.isAccountIncluded(account.id);

            return (
              <div
                key={account.id}
                role="button"
                tabIndex={0}
                onClick={() => store.toggleAccount(account.id)}
                onKeyDown={(event) => handleKeyDown(event, account.id)}
                className={cn(
                  "w-full bg-card rounded-xl shadow-sm border-none transition-all active:scale-95",
                  !isIncluded && "opacity-60",
                )}
              >
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="relative shrink-0">
                    <div className={cn("w-10 h-10 rounded-lg", colorInfo.bg)} />
                    <div
                      className={cn(
                        "absolute inset-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold",
                        colorInfo.text,
                      )}
                    >
                      {getCurrencySymbol(account.currency)}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <h3 className="font-semibold text-foreground text-base truncate">
                      {account.name}
                    </h3>
                  </div>

                  <Checkbox
                    checked={isIncluded}
                    tabIndex={-1}
                    className="pointer-events-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!isLoading && accounts.length > 0 && (
        <Footer className="z-50 grid-cols-1">
          <Button
            size="lg"
            type="button"
            onClick={store.save}
            disabled={!store.isDirty || monthlyBreakdownStore.isSaving}
          >
            <LoadingSwap isLoading={monthlyBreakdownStore.isSaving}>
              {t("save")}
            </LoadingSwap>
          </Button>
        </Footer>
      )}
    </Page>
  );
}
