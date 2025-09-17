import { Transaction } from "api";
import { formatAmount } from "../../shared/currency-formatter";
import { formatDisplayDate } from "@/shared/format-display-date";
import { AccountBadge } from "../accounts/account-badge";
import { cn } from "@/lib/utils";
import { useRouter } from "@/shared/stacked-router/router";

export function TransactionItem({
  transaction,
  showBorder = false,
}: {
  transaction: Transaction;
  showBorder?: boolean;
}) {
  const { navigate } = useRouter();
  const isIncome = transaction.type === "income";

  const handleClick = () => {
    navigate({ type: "transactionForm", transactionId: transaction.id });
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors",
        showBorder && "border-b",
      )}
      onClick={handleClick}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm text-foreground">
            {transaction.desc}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">
            {formatDisplayDate(transaction.createdAt)}
          </p>
          <AccountBadge accountId={transaction.accountId} />
        </div>
      </div>
      <div className="self-start flex items-end flex-col gap-1 text-right">
        <div
          className={cn(
            "flex items-center gap-1 font-semibold text-sm font-mono",
            isIncome && "text-green-700 dark:text-green-400",
          )}
        >
          <span>{isIncome ? "+" : ""}</span>
          <span>{formatAmount(transaction.amount, transaction.currency)}</span>
        </div>
        {transaction.currency !== "USD" && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-mono",
              isIncome
                ? "text-green-600 dark:text-green-400"
                : "text-muted-foreground",
            )}
          >
            <span>{isIncome ? "+" : ""}</span>
            <span>{formatAmount(transaction.usdAmount, "USD")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
