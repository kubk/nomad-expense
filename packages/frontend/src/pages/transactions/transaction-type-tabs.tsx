import type { TransactionType } from "api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { haptic } from "@/shared/platform/haptics";
import { useTranslation } from "@/translations/translation-provider";

export function TransactionTypeTabs({
  value,
  onChange,
  className,
}: {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <Tabs
      className={className}
      value={value}
      onValueChange={(type) => {
        haptic("selection");
        onChange(type as TransactionType);
      }}
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="expense">{t("transactionTypeExpense")}</TabsTrigger>
        <TabsTrigger value="income">{t("transactionTypeIncome")}</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
