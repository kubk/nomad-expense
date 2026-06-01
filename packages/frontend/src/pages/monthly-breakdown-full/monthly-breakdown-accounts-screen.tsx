import { useEffect, useState, type KeyboardEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getCurrencySymbol } from "@/shared/currency-formatter";
import { RouteByType, useRouter } from "@/shared/stacked-router/router";
import { isFormRoute } from "@/shared/stacked-router/routes";
import { useTranslation } from "@/translations/translation-provider";
import { cn } from "@/lib/utils";
import { haptic } from "@/shared/platform/haptics";
import { Footer } from "../widgets/footer";
import { NoAccountsEmptyState } from "../widgets/no-accounts-empty-state";
import { Page } from "../widgets/page";
import { getColorById } from "../accounts/account-colors";
import { useMonthlyBreakdownAccountIds } from "@/shared/hooks/use-monthly-breakdown-settings";

function areAccountIdsEqual(first: string[], second: string[]) {
  if (first.length !== second.length) return false;

  const firstSet = new Set(first);
  return second.every((accountId) => firstSet.has(accountId));
}

export function MonthlyBreakdownAccountsScreen({
  route,
}: {
  route: RouteByType<"monthlyBreakdownAccounts">;
}) {
  const { pop } = useRouter();
  const { t } = useTranslation();
  const {
    accounts,
    excludedAccountIds,
    isLoading,
    isSaving,
    setExcludedAccountIds,
  } = useMonthlyBreakdownAccountIds();
  const [draftExcludedAccountIds, setDraftExcludedAccountIds] = useState<
    string[]
  >([]);

  useEffect(() => {
    setDraftExcludedAccountIds(excludedAccountIds);
  }, [excludedAccountIds]);

  const isDirty = !areAccountIdsEqual(
    draftExcludedAccountIds,
    excludedAccountIds,
  );

  const isAccountIncluded = (accountId: string) => {
    return !draftExcludedAccountIds.includes(accountId);
  };

  const toggleAccount = (accountId: string) => {
    haptic("selection");
    setDraftExcludedAccountIds((currentExcludedAccountIds) =>
      !currentExcludedAccountIds.includes(accountId)
        ? [...currentExcludedAccountIds, accountId]
        : currentExcludedAccountIds.filter(
            (excludedId) => excludedId !== accountId,
          ),
    );
  };

  const handleSave = async () => {
    haptic("medium");
    await setExcludedAccountIds(draftExcludedAccountIds);
    pop();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    accountId: string,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    toggleAccount(accountId);
  };

  return (
    <Page
      title={t("monthlyBreakdownAccountsTitle")}
      isForm={isFormRoute(route)}
    >
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
            const isIncluded = isAccountIncluded(account.id);

            return (
              <div
                key={account.id}
                role="button"
                tabIndex={0}
                onClick={() => toggleAccount(account.id)}
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
            onClick={handleSave}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("save")
            )}
          </Button>
        </Footer>
      )}
    </Page>
  );
}
