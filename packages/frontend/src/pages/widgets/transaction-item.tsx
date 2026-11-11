import { Transaction } from "api";
import { formatAmount } from "../../shared/currency-formatter";
import { formatDisplayDate } from "@/shared/format-display-date";
import { AccountBadge } from "../accounts/account-badge";
import { cn } from "@/lib/utils";
import { routerStore } from "@/shared/stacked-router/router-store";
import { familyStore } from "@/store/family-store";
import { haptic } from "@/shared/platform/haptics";
import { t } from "@/translations/translation-store";

export function TransactionItem({
  transaction,
  borderBottom = false,
}: {
  transaction: Transaction;
  borderBottom?: boolean;
}) {
  const isIncome = transaction.type === "income";

  const handleClick = () => {
    haptic("selection");
    routerStore.navigate({
      type: "transactionForm",
      transactionId: transaction.id,
    });
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors",
        borderBottom && "border-b",
      )}
      onClick={handleClick}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "font-medium text-sm text-foreground",
              !transaction.isCountable && "text-muted-foreground",
            )}
          >
            {transaction.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">
            {formatDisplayDate(transaction.createdAt, {
              today: t("dateToday"),
              yesterday: t("dateYesterday"),
            })}
          </p>
          <AccountBadge accountId={transaction.accountId} />
        </div>
      </div>
      <div className="self-start flex items-end flex-col gap-1 text-right">
        <div
          className={cn(
            "flex items-center gap-1 font-semibold text-sm font-mono",
            isIncome &&
              transaction.isCountable &&
              "text-green-700 dark:text-green-400",
            !transaction.isCountable && "text-muted-foreground",
          )}
        >
          <span>{isIncome ? "+" : ""}</span>
          <span>{formatAmount(transaction.amount, transaction.currency)}</span>
        </div>
        {transaction.currency !== familyStore.baseCurrency && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-mono",
              isIncome && transaction.isCountable
                ? "text-green-600 dark:text-green-400"
                : "text-muted-foreground",
            )}
          >
            <span>{isIncome ? "+" : ""}</span>
            <span>
              {formatAmount(transaction.usdAmount, familyStore.baseCurrency)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
