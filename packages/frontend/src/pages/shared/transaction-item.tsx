import { Transaction, Account } from "../../shared/types";
import { currencyStore } from "../../store/currency-store";
import {
  convert,
  formatAmount,
  SupportedCurrency,
} from "../../shared/currency-converter";
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
  // Convert the transaction amount to base currency for comparison display
  const amountInBaseCurrency = convert(
    transaction.usd,
    "USD",
    currencyStore.baseCurrency,
  );

  const isIncome = transaction.amount > 0;
  const displayAmount = Math.abs(transaction.amount);
  const displayAmountInBaseCurrency = Math.abs(amountInBaseCurrency);

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
          className={`font-semibold text-sm ${isIncome ? "text-green-700" : ""}`}
        >
          {isIncome ? "+ " : ""}
          {formatAmount(
            displayAmount,
            transaction.currency as SupportedCurrency,
          )}
        </p>
        {transaction.currency !== currencyStore.baseCurrency && (
          <p
            className={`text-xs ${isIncome ? "text-green-600" : "text-muted-foreground"}`}
          >
            {isIncome ? "+ " : ""}
            {formatAmount(
              displayAmountInBaseCurrency,
              currencyStore.baseCurrency,
            )}
          </p>
        )}
      </div>
    </div>
  );
}
