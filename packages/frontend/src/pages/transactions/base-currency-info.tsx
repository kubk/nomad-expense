import { useBaseCurrency } from "@/shared/hooks/use-base-currency";
import { formatAmount } from "@/shared/currency-formatter";
import { SupportedCurrency } from "api";

export function BaseCurrencyInfo({
  amount,
  currency,
  usdAmount,
}: {
  amount: number;
  currency: SupportedCurrency;
  usdAmount: number;
}) {
  const baseCurrency = useBaseCurrency();

  if (currency === baseCurrency) {
    return null;
  }

  const rate = Math.abs(amount / usdAmount);

  return (
    <div className="flex flex-col gap-0.5 pl-0.5">
      <span className="text-sm text-muted-foreground">
        {formatAmount(usdAmount, baseCurrency)}
      </span>
      <span className="text-xs text-muted-foreground">
        Rate: 1 {baseCurrency} = {rate.toFixed(2)} {currency}
      </span>
    </div>
  );
}
