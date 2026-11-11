import type { TransactionType } from "api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { haptic } from "@/shared/platform/haptics";
import { t } from "@/translations/translation-store";

export function TransactionTypeTabs({
  value,
  onChange,
  className,
}: {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
  className?: string;
}) {
  return (
    <Tabs
      className={className}
      value={value}
      onValueChange={(type) => {
        haptic("selection");
        onChange(type as TransactionType);
      }}
    >
      <TabsList className="grid w-full grid-cols-2 bg-foreground/5 dark:bg-card">
        <TabsTrigger value="expense">{t("transactionTypeExpense")}</TabsTrigger>
        <TabsTrigger value="income">{t("transactionTypeIncome")}</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
