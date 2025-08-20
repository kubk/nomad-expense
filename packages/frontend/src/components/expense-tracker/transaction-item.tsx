import { Transaction, Account } from "./types";
import { formatDisplayDate } from "./utils";
import { useCurrency } from "./currency-context";
import { SupportedCurrency } from "./currency-service";

interface TransactionItemProps {
  transaction: Transaction;
  account: Account | undefined;
  showBorder?: boolean;
}

export const TransactionItem = ({
  transaction,
  account,
  showBorder = false,
}: TransactionItemProps) => {
  const { baseCurrency, formatAmount, currencyService } = useCurrency();

  // Convert the transaction amount to base currency for comparison display
  const amountInBaseCurrency = currencyService.convert(
    transaction.usd,
    "USD",
    baseCurrency,
  );

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
      <div className="text-right">
        <p className="font-semibold text-sm">
          {formatAmount(
            transaction.amount,
            transaction.currency as SupportedCurrency,
          )}
        </p>
        {transaction.currency !== baseCurrency && (
          <p className="text-xs text-gray-500">
            {formatAmount(amountInBaseCurrency, baseCurrency)}
          </p>
        )}
      </div>
    </div>
  );
};
