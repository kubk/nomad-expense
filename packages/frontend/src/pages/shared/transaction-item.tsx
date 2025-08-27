import { Transaction, SupportedCurrency } from "api";
import { formatAmount } from "../../shared/currency-formatter";
import { formatDisplayDate } from "@/shared/format-display-date";
import { AccountBadge } from "../accounts/account-badge";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { render } from "typesafe-routes";
import { routes } from "../../shared/routes";

export function TransactionItem({
  transaction,
  showBorder = false,
}: {
  transaction: Transaction;
  showBorder?: boolean;
}) {
  const [, navigate] = useLocation();
  const isIncome = transaction.type === "income";
  const displayAmount = transaction.amount;
  const displayAmountInUSD = transaction.usd;

  const handleClick = () => {
    navigate(
      render(routes.transactionForm, {
        query: { transactionId: transaction.id },
        path: {},
      }),
    );
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
      <div className="self-start flex flex-col gap-1 text-right">
        <div
          className={cn(
            "flex items-center gap-1 font-semibold text-sm font-mono",
            isIncome && "text-green-700 dark:text-green-400",
          )}
        >
          <span>{isIncome ? "+" : ""}</span>
          <span>
            {formatAmount(
              displayAmount,
              transaction.currency as SupportedCurrency,
            )}
          </span>
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
            <span>{formatAmount(displayAmountInUSD, "USD")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
