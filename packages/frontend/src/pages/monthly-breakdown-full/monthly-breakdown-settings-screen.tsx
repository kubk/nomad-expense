import { ChevronRightIcon, CreditCardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Page } from "../widgets/page";
import { RouteByType, useRouter } from "@/shared/stacked-router/router";
import { isFormRoute } from "@/shared/stacked-router/routes";
import { useTranslation } from "@/translations/translation-provider";
import { haptic } from "@/shared/platform/haptics";
import { useMonthlyBreakdownAccountIds } from "@/shared/hooks/use-monthly-breakdown-settings";

export function MonthlyBreakdownSettingsScreen({
  route,
}: {
  route: RouteByType<"monthlyBreakdownSettings">;
}) {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { accounts, includedAccountIds, isLoading } =
    useMonthlyBreakdownAccountIds();

  const selectedAccountsLabel =
    includedAccountIds.length === accounts.length
      ? t("filtersAll")
      : t("filtersAccountCount", includedAccountIds.length);

  return (
    <Page
      title={t("monthlyBreakdownSettingsTitle")}
      isForm={isFormRoute(route)}
    >
      <div className="space-y-8 mt-2">
        <div className="space-y-4">
          <Button
            onClick={() => {
              haptic("light");
              navigate({ type: "monthlyBreakdownAccounts" });
            }}
            variant="outline"
            className="w-full justify-between"
          >
            <div className="flex items-center gap-3">
              <CreditCardIcon className="size-4" />
              <span>{t("monthlyBreakdownSettingsIncludedAccounts")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              {isLoading ? (
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
