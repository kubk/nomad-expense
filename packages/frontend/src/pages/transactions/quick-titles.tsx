import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/shared/api";
import { useQuery } from "@tanstack/react-query";
import { TransactionType } from "api";

export function QuickTitles({
  accountId,
  transactionType,
  onTitleClick,
}: {
  accountId: string;
  transactionType: TransactionType;
  onTitleClick: (title: string) => void;
}) {
  const { data: titles, isLoading } = useQuery(
    trpc.expenses.getMostUsedDescriptions.queryOptions({
      accountId,
      transactionType,
    }),
  );

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-7 rounded-md flex-shrink-0"
              style={{ width: `${60 + Math.random() * 40}px` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!titles || titles.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2 pb-2">
        {titles.map((title) => (
          <Badge
            key={title}
            variant="outline"
            className="cursor-pointer py-[5px] flex-shrink-0"
            onClick={() => onTitleClick(title)}
          >
            {title}
          </Badge>
        ))}
      </div>
    </div>
  );
}
