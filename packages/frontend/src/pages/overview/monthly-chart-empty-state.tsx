import { useTranslation } from "@/translations/translation-provider";

export function MonthlyChartEmptyState() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full mb-6">
        <div className="flex items-end justify-between h-[85px] gap-2">
          {[0.8, 0.6, 0.7, 0.9].map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-muted/50 rounded-t"
              style={{ height: `${height * 100}%` }}
            />
          ))}
        </div>
      </div>
      <h3 className="text-md font-semibold text-foreground">
        {t("overviewNoTransactions")}
      </h3>
      <p className="text-xs text-muted-foreground text-center mt-1">
        {t("overviewNoTransactionsDescription")}
      </p>
    </div>
  );
}
