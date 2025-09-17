import { formatAmount } from "@/shared/currency-formatter";
import { UserAvatar } from "@/components/user-avatar";
import { trpc } from "../../shared/api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@/shared/stacked-router/router";
import { getWebApp } from "@/shared/telegram/telegram";
import { cn } from "@/lib/utils";

export function OverviewHeader() {
  const { navigate } = useRouter();

  const { data: overviewData, isLoading: isOverviewLoading } = useQuery(
    trpc.expenses.overview.queryOptions(),
  );

  const { data: familyMembers, isLoading: isFamilyLoading } = useQuery(
    trpc.family.listMembers.queryOptions(),
  );

  return (
    <div
      className={cn("text-primary-foreground bg-muted px-4 pb-6 pt-4 pb-18", {
        "pt-1": getWebApp(),
      })}
    >
      <div className="bg-background backdrop-blur dark:border shadow-sm rounded-2xl p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-foreground/70 text-sm mb-1">
              Expenses · Last 30 days
            </p>
            <div className="text-3xl text-foreground font-bold font-mono">
              {isOverviewLoading ? (
                <div className="animate-pulse bg-accent h-9 w-32 rounded" />
              ) : (
                formatAmount(overviewData?.last30DaysTotal || 0, "USD", {
                  showFractions: false,
                })
              )}
            </div>
          </div>
          <div
            className="self-center flex -space-x-2 cursor-pointer active:scale-95 transition-transform"
            onClick={() => {
              navigate({ type: "family" });
            }}
          >
            {isFamilyLoading ? (
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
