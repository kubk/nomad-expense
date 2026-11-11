import { formatAmount } from "@/shared/currency-formatter";
import { UserAvatar } from "@/components/user-avatar";
import { routerStore } from "@/shared/stacked-router/router-store";
import { isTelegram } from "@/shared/platform/telegram-platform";
import { cn } from "@/lib/utils";
import { familyStore } from "@/store/family-store";
import { haptic } from "@/shared/platform/haptics";
import { t } from "@/translations/translation-store";
import { overviewStore } from "@/store/overview-store";

export function OverviewHeader() {
  const familyMembers = familyStore.membersQuery.data;

  return (
    <div
      className={cn("text-primary-foreground bg-muted px-4 pb-6 pt-4 pb-18", {
        "pt-1": isTelegram(),
      })}
    >
      <div className="bg-background backdrop-blur dark:border shadow-sm rounded-2xl p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-foreground/70 text-sm mb-1">
              {t("overviewExpensesLast30Days")}
            </p>
            <div className="text-3xl text-foreground font-bold font-mono">
              {overviewStore.isLoading ? (
                <div className="animate-pulse bg-accent h-9 w-32 rounded" />
              ) : (
                formatAmount(
                  overviewStore.overview?.last30DaysTotal || 0,
                  familyStore.baseCurrency,
                  {
                    showFractions: false,
                  },
                )
              )}
            </div>
          </div>
          <div
            className="self-center flex -space-x-2 cursor-pointer active:scale-95 transition-transform"
            onClick={() => {
              haptic("light");
              routerStore.navigate({ type: "family" });
            }}
          >
            {familyStore.membersQuery.isPending ? (
              <div className="animate-pulse bg-accent h-12 w-12 rounded-full" />
            ) : (
              familyMembers?.map((member, index) => (
                <div
                  key={member.id}
                  className="ring-muted dark:ring-foreground ring-2 rounded-full bg-background"
                  style={{ zIndex: familyMembers.length - index }}
                >
                  <UserAvatar
                    user={member}
                    className="[&>div]:bg-background/20 [&>div]:text-primary-foreground [&>div]:text-xs"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
