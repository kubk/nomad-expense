import { familyStore } from "@/store/family-store";
import { formatAmount } from "@/shared/currency-formatter";
import { SupportedCurrency } from "api";
import { t } from "@/translations/translation-store";

export function BaseCurrencyInfo({
  amount,
  currency,
  usdAmount,
}: {
  amount: number;
  currency: SupportedCurrency;
  usdAmount: number;
}) {
  if (currency === familyStore.baseCurrency) {
    return null;
  }

  const rate = Math.abs(amount / usdAmount);

  return (
    <div className="flex flex-col gap-0.5 pl-0.5">
      <span className="text-sm text-muted-foreground">
        {formatAmount(usdAmount, familyStore.baseCurrency)}
      </span>
      <span className="text-xs text-muted-foreground">
        {t(
          "transactionsRate",
          familyStore.baseCurrency,
          rate.toFixed(2),
          currency,
        )}
      </span>
    </div>
  );
}
