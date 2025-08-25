import { formatAmount } from "@/shared/currency-formatter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { api } from "../../api";

export function OverviewHeader() {
  const { data: overviewData, isLoading } = api.expenses.overview.useQuery();

  return (
    <div className="bg-primary text-primary-foreground dark:bg-muted px-4 py-6 pb-18">
      <div className="bg-background/10 dark:bg-background/50 backdrop-blur rounded-2xl p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary-foreground/70 dark:text-foreground/70 text-sm mb-1">
              Last 30 days
            </p>
            <div className="text-3xl dark:text-foreground font-bold">
              {isLoading ? (
                <div className="animate-pulse bg-muted h-9 w-32 rounded"></div>
              ) : (
                formatAmount(overviewData?.last30DaysTotal || 0, "USD", { showFractions: false })
              )}
            </div>
          </div>
          <div className="self-center *:data-[slot=avatar]:ring-background dark:*:data-[slot=avatar]:ring-foreground flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:w-10 *:data-[slot=avatar]:h-10">
            <Avatar>
              <AvatarImage src="https://github.com/kubk.png" alt="User 1" />
              <AvatarFallback className="bg-background/20 text-primary-foreground text-xs">EG</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="https://t.me/i/userpic/160/RoxieFly.jpg" alt="User 2" />
              <AvatarFallback className="bg-background/20 text-primary-foreground text-xs">U2</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  );
}
