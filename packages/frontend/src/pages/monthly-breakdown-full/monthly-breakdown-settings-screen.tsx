import { ChevronRightIcon, CreditCardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Page } from "../widgets/page";
import { routerStore } from "@/shared/stacked-router/router-store";
import { t } from "@/translations/translation-store";
import { haptic } from "@/shared/platform/haptics";
import { accountsStore } from "@/store/accounts-store";
import { monthlyBreakdownStore } from "@/store/monthly-breakdown-store";

export function MonthlyBreakdownSettingsScreen() {
  const includedAccountIds = monthlyBreakdownStore.includedAccountIds;

  const selectedAccountsLabel =
    includedAccountIds.length === accountsStore.accounts.length
      ? t("filtersAll")
      : t("filtersAccountCount", includedAccountIds.length);

  return (
    <Page title={t("monthlyBreakdownSettingsTitle")}>
      <div className="space-y-8 mt-2">
        <div className="space-y-4">
          <Button
            onClick={() => {
              haptic("light");
              routerStore.navigate({ type: "monthlyBreakdownAccounts" });
            }}
            variant="outline"
            className="w-full justify-between"
          >
            <div className="flex items-center gap-3">
              <CreditCardIcon className="size-4" />
              <span>{t("monthlyBreakdownSettingsIncludedAccounts")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              {monthlyBreakdownStore.isLoading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                <span className="text-sm">{selectedAccountsLabel}</span>
              )}
              <ChevronRightIcon className="size-4" />
            </div>
          </Button>
        </div>
      </div>
    </Page>
  );
}
