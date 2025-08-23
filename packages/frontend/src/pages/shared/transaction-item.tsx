import { Transaction, SupportedCurrency } from "api";
import { formatAmount } from "../../shared/currency-converter";
import { formatDisplayDate } from "@/shared/utils";
import { api } from "@/api";
import { getColorById } from "../accounts/account-colors";

export function TransactionItem({
  transaction,
  showBorder = false,
}: {
  transaction: Transaction;
  showBorder?: boolean;
}) {
  const { data: accounts = [] } = api.accounts.list.useQuery();
  const account = accounts.find((a) => a.id === transaction.accountId);
  const colorInfo = getColorById(account?.color || "blue");
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
          <p className="font-medium text-sm text-foreground">
            {transaction.desc}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground">
            {formatDisplayDate(transaction.date)}
          </p>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorInfo.bg} ${colorInfo.text}`}>
            <span>{account?.name}</span>
          </div>
        </div>
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
