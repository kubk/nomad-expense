import { Transaction, SupportedCurrency } from "api";
import { formatAmount } from "../../shared/currency-formatter";
import { formatDisplayDate } from "@/shared/utils";
import { AccountBadge } from "../accounts/account-badge";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { render } from "typesafe-routes";
import { routes } from "../../routes";

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
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm text-foreground">
            {transaction.desc}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground">
            {formatDisplayDate(transaction.createdAt)}
          </p>
          <AccountBadge accountId={transaction.accountId} />
        </div>
      </div>
      <div className="self-start text-right">
        <p
          className={cn(
            "font-semibold text-sm",
            isIncome && "text-green-700 dark:text-green-400",
          )}
        >
          {isIncome ? "+ " : ""}
          {formatAmount(
            displayAmount,
            transaction.currency as SupportedCurrency,
          )}
        </p>
        {transaction.currency !== "USD" && (
          <p
            className={cn(
              "text-xs",
              isIncome
                ? "text-green-600 dark:text-green-400"
                : "text-muted-foreground",
            )}
          >
            {isIncome ? "+ " : ""}
            {formatAmount(displayAmountInUSD, "USD")}
          </p>
        )}
      </div>
    </div>
  );
}
