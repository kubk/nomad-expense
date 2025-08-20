import { Transaction, Account } from "./types";
import { formatDisplayDate } from "./utils";
import { useCurrency } from "./currency-context";
import { currencyService, SupportedCurrency } from "./currency-service";

export function TransactionItem({
  transaction,
  account,
  showBorder = false,
}: {
  transaction: Transaction;
  account: Account | undefined;
  showBorder?: boolean;
}) {
  const { baseCurrency } = useCurrency();

  // Convert the transaction amount to base currency for comparison display
  const amountInBaseCurrency = currencyService.convert(
    transaction.usd,
    "USD",
    baseCurrency,
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
          <p className="font-medium text-sm text-gray-900">
            {transaction.desc}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {formatDisplayDate(transaction.date)}
        </p>
      </div>
      <div className="self-start text-right">
        <p
          className={`font-semibold text-sm ${isIncome ? "text-green-700" : ""}`}
        >
          {isIncome ? "+ " : ""}
          {currencyService.formatAmount(
            displayAmount,
            transaction.currency as SupportedCurrency,
          )}
        </p>
        {transaction.currency !== baseCurrency && (
          <p
            className={`text-xs ${isIncome ? "text-green-600" : "text-gray-500"}`}
          >
            {isIncome ? "+ " : ""}
            {currencyService.formatAmount(
              displayAmountInBaseCurrency,
              baseCurrency,
            )}
          </p>
        )}
      </div>
    </div>
  );
}
