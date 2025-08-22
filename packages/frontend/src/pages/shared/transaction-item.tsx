import { Transaction, Account, SupportedCurrency } from "api";
import { formatAmount } from "../../shared/currency-converter";
import { formatDisplayDate } from "@/shared/utils";

export function TransactionItem({
  transaction,
  account,
  showBorder = false,
}: {
  transaction: Transaction;
  account: Account | undefined;
  showBorder?: boolean;
}) {
  const isIncome = transaction.amount > 0;
  const displayAmount = Math.abs(transaction.amount);
  const displayAmountInUSD = Math.abs(transaction.usd);

  return (
    <div
      className={`flex items-center justify-between p-4 ${
        showBorder ? "border-b" : ""
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-2 h-2 rounded-full ${account?.color}`} />
          <p className="font-medium text-sm text-foreground">
            {transaction.desc}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDisplayDate(transaction.date)}
        </p>
      </div>
      <div className="self-start text-right">
        <p
          className={`font-semibold text-sm ${isIncome ? "text-green-700 dark:text-green-400" : ""}`}
        >
          {isIncome ? "+ " : ""}
          {formatAmount(
            displayAmount,
            transaction.currency as SupportedCurrency,
          )}
        </p>
        {transaction.currency !== "USD" && (
          <p
            className={`text-xs ${isIncome ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
          >
            {isIncome ? "+ " : ""}
            {formatAmount(displayAmountInUSD, "USD")}
          </p>
        )}
      </div>
    </div>
  );
}
