import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeftIcon } from "lucide-react";
import { TransactionFilters } from "api";
import { useAvailableYears } from "@/shared/hooks/use-available-years";
import {
  getFullMonthName,
  getMonthNumbers,
  isMonthInFuture,
} from "@/shared/date-utils";

type CustomDateValue = { year: number; month: number };

export function CustomDatePicker({
  filters,
  onApply,
  onBack,
}: {
  filters: TransactionFilters;
  onApply: (filters: TransactionFilters) => void;
  onBack: () => void;
}) {
  const availableYears = useAvailableYears();

  const [selectedMonths, setSelectedMonths] = useState<CustomDateValue[]>(
    () => {
      if (filters.date.type === "custom") {
        return filters.date.value;
      }
      return [];
    },
  );

  const monthNumbers = getMonthNumbers();

  const isMonthSelected = (year: number, month: number) => {
    return selectedMonths.some((m) => m.year === year && m.month === month);
  };

  const isYearFullySelected = (year: number) => {
    const availableMonths = monthNumbers.filter(
      (month) => !isMonthInFuture(year, month),
    );
    return (
      availableMonths.length > 0 &&
      availableMonths.every((month) => isMonthSelected(year, month))
    );
  };

  const toggleMonth = (year: number, month: number) => {
    setSelectedMonths((prev) => {
      const exists = prev.find((m) => m.year === year && m.month === month);
      if (exists) {
        return prev.filter((m) => !(m.year === year && m.month === month));
      } else {
        return [...prev, { year, month }];
      }
    });
  };

  const toggleYear = (year: number) => {
    const isFullySelected = isYearFullySelected(year);

    if (isFullySelected) {
      // Remove all months for this year
      setSelectedMonths((prev) => prev.filter((m) => m.year !== year));
    } else {
      // Add only available (non-future) months for this year
      setSelectedMonths((prev) => {
        const withoutThisYear = prev.filter((m) => m.year !== year);
        const availableMonths = monthNumbers.filter(
          (month) => !isMonthInFuture(year, month),
        );
        const availableMonthsForYear = availableMonths.map((month) => ({
          year,
          month,
        }));
        return [...withoutThisYear, ...availableMonthsForYear];
      });
    }
  };

  const handleApply = () => {
    onApply({
      ...filters,
      date: {
        type: "custom",
        value: selectedMonths,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 w-8 p-0"
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <h3 className="font-medium">Custom date range</h3>
      </div>

      {/* Years and Months */}
      <ScrollArea className="h-64" type="always">
        <div className="space-y-4 p-1">
          {availableYears.map((year) => (
            <div key={year} className="space-y-3">
              {/* Year Header */}
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`year-${year}`}
                  checked={isYearFullySelected(year)}
                  onCheckedChange={() => toggleYear(year)}
                />
                <label
                  htmlFor={`year-${year}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {year}
                </label>
              </div>

              {/* Months */}
              <div className="grid grid-cols-2 sm:grid-cols-3">
                {monthNumbers.map((month) => {
                  const isSelected = isMonthSelected(year, month);
                  const isFuture = isMonthInFuture(year, month);

                  return (
                    <label
                      key={month}
                      htmlFor={`${year}-${month}`}
                      className={`flex items-center gap-2 p-3 border-r border-b border-muted transition-colors w-full ${
                        isFuture
                          ? "opacity-50 cursor-not-allowed"
                          : isSelected
                            ? "bg-primary/10 cursor-pointer"
                            : "cursor-pointer"
                      }`}
                    >
                      <Checkbox
                        id={`${year}-${month}`}
                        checked={isSelected}
                        disabled={isFuture}
                        onCheckedChange={() =>
                          !isFuture && toggleMonth(year, month)
                        }
                      />
                      <span className="text-sm select-none flex-1">
                        {getFullMonthName(month)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="flex flex-col gap-2 py-4">
        <Button size="lg" onClick={handleApply}>
          Apply filters
        </Button>
        <Button size="lg" variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
}
