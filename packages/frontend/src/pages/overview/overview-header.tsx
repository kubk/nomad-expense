import { formatAmount } from "@/shared/currency-formatter";
import { UserAvatar } from "@/components/user-avatar";
import { api } from "../../api";

export function OverviewHeader() {
  const { data: overviewData, isLoading } = api.expenses.overview.useQuery();
  const { data: familyMembers } = api.family.listMembers.useQuery();

  return (
    <div className="bg-primary text-primary-foreground dark:bg-muted px-4 py-6 pb-18">
      <div className="bg-background/10 dark:bg-background/50 backdrop-blur rounded-2xl p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary-foreground/70 dark:text-foreground/70 text-sm mb-1">
              Expenses · Last 30 days
            </p>
            <div className="text-3xl dark:text-foreground font-bold font-mono">
              {isLoading ? (
                <div className="animate-pulse bg-muted h-9 w-32 rounded"></div>
              ) : (
                formatAmount(overviewData?.last30DaysTotal || 0, "USD", {
                  showFractions: false,
                })
              )}
            </div>
          </div>
          <div className="self-center flex -space-x-2">
            {familyMembers?.map((member, index) => (
              <div 
                key={member.id} 
                className="ring-background dark:ring-foreground ring-2 rounded-full bg-background"
                style={{ zIndex: familyMembers.length - index }}
              >
                <UserAvatar
                  user={member}
                  className="[&>div]:bg-background/20 [&>div]:text-primary-foreground [&>div]:text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
