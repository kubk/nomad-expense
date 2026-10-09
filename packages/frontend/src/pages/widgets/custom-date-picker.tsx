import { useLayoutEffect, useRef, useState } from "react";
import { DateTime } from "luxon";
import type { DateRange } from "react-day-picker";
import { enUS, ru } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DrawerFooter } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TransactionFilters } from "api";
import { useAvailableYears } from "@/shared/hooks/use-available-years";
import {
  formatTransactionDateRange,
  getTransactionDateRange,
} from "@/shared/transaction-date-range";
import { haptic } from "@/shared/platform/haptics";
import { useTranslation } from "@/translations/translation-provider";

function getMonthPair(date: Date) {
  return new Date(date.getFullYear(), Math.floor(date.getMonth() / 2) * 2, 1);
}

export function CustomDatePicker({
  filters,
  onApply,
  onBack,
}: {
  filters: TransactionFilters;
  onApply: (filters: TransactionFilters) => void;
  onBack: (filters?: TransactionFilters) => void;
}) {
  const { t, language } = useTranslation();
  const availableYears = useAvailableYears(filters.accounts);
  const [range, setRange] = useState<DateRange>(() => getTransactionDateRange(filters.date));
  const initialRangeRef = useRef(range);
  const [month, setMonth] = useState(() => getMonthPair(range.from ?? new Date()));
  const monthStripRef = useRef<HTMLDivElement>(null);
  const selectedMonthRef = useRef<HTMLButtonElement>(null);
  const currentYear = new Date().getFullYear();
  const firstYear = Math.min(currentYear - 3, ...availableYears, month.getFullYear());
  const lastYear = Math.max(currentYear + 1, ...availableYears, month.getFullYear());
  const monthFormatter = new Intl.DateTimeFormat(language, { month: "short" });
  const formatMonthLabel = (date: Date) => monthFormatter.format(date).replace(/\.$/, "");
  const monthPairs = Array.from({ length: (lastYear - firstYear + 1) * 6 }, (_, index) =>
    new Date(firstYear + Math.floor(index / 6), (index % 6) * 2, 1),
  );

  useLayoutEffect(() => {
    const strip = monthStripRef.current;
    const selected = selectedMonthRef.current;
    if (strip && selected) {
      strip.scrollLeft = selected.offsetLeft - (strip.clientWidth - selected.clientWidth) / 2;
    }
  }, [month, firstYear, lastYear]);

  const getSelectedFilters = (): TransactionFilters | undefined => {
    if (!range.from || !range.to) return undefined;
    return {
      ...filters,
      date: {
        type: "range",
        from: DateTime.fromJSDate(range.from).toFormat("yyyy-MM-dd"),
        to: DateTime.fromJSDate(range.to).toFormat("yyyy-MM-dd"),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };
  };

  const handleBack = () => {
    const initialRange = initialRangeRef.current;
    const hasChanged = range.from?.getTime() !== initialRange.from?.getTime()
      || range.to?.getTime() !== initialRange.to?.getTime();
    onBack(hasChanged ? getSelectedFilters() : undefined);
  };

  return (
    <Tabs
      value={String(month.getTime())}
      onValueChange={(value) => {
        haptic("selection");
        setMonth(new Date(Number(value)));
      }}
      className="flex min-h-0 flex-1 flex-col gap-0"
    >
      <div className="shrink-0 px-4 pt-5 pb-4">
        <div
          ref={monthStripRef}
          data-vaul-no-drag
          className="relative overflow-x-auto rounded-lg bg-muted [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <TabsList className="h-16 justify-start gap-1">
          {monthPairs.map((pair) => {
            const isSelected = pair.getTime() === month.getTime();
            const nextMonth = new Date(pair.getFullYear(), pair.getMonth() + 1, 1);
            return (
              <TabsTrigger
                key={pair.getTime()}
                value={String(pair.getTime())}
                ref={isSelected ? selectedMonthRef : undefined}
                className="h-[58px] min-w-[88px] shrink-0 flex-none flex-col gap-0.5 px-2"
              >
                <span className="whitespace-nowrap">{formatMonthLabel(pair)}-{formatMonthLabel(nextMonth)}</span>
                <span className="text-xs font-normal opacity-65">{pair.getFullYear()}</span>
              </TabsTrigger>
            );
          })}
          </TabsList>
        </div>
      </div>
      <TabsContent
        value={String(month.getTime())}
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-5"
        data-vaul-no-drag
      >
        <Calendar
          mode="range"
          selected={range}
          onSelect={(nextRange) => {
            haptic("selection");
            setRange(nextRange ?? { from: undefined });
          }}
          resetOnSelect
          month={month}
          onMonthChange={(nextMonth) => setMonth(getMonthPair(nextMonth))}
          numberOfMonths={2}
          pagedNavigation
          locale={language === "ru" ? ru : enUS}
          className="w-full p-0 [--cell-size:44px] [&_[data-day]]:h-11 [&_[data-day]]:min-w-0 [&_[data-day]]:aspect-auto"
          classNames={{
            root: "w-full",
            months: "relative flex w-full flex-col gap-6",
            month: "flex w-full flex-col gap-2",
            day: "group/day relative h-11 w-full p-0 text-center select-none",
            week: "mt-1 flex w-full",
          }}
        />
      </TabsContent>
      <div className="shrink-0 border-t">
        <p className="px-4 py-6 text-center text-lg leading-snug font-semibold tracking-tight">
          {formatTransactionDateRange(range, language) || t("filtersChooseDates")}
        </p>
        <DrawerFooter className="flex-row pt-0 [&_button]:flex-1">
          <Button size="lg" variant="outline" onClick={handleBack}>
            {t("back")}
          </Button>
          <Button
            size="lg"
            disabled={!range.from || !range.to}
            onClick={() => {
              const selectedFilters = getSelectedFilters();
              if (selectedFilters) onApply(selectedFilters);
            }}
          >
            {t("applyFilters")}
          </Button>
        </DrawerFooter>
      </div>
    </Tabs>
  );
}
