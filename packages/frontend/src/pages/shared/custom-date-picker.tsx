import { useState } from "react";
import { useLocation } from "wouter";
import { render } from "typesafe-routes";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeftIcon } from "lucide-react";
import { TransactionFilters } from "api";
import { useAvailableYears } from "@/shared/hooks/use-available-years";
import { routes } from "../../routes";

type CustomDateValue = { year: number; month: number };

export function CustomDatePicker({
  filters,
  onBack,
}: {
  filters: TransactionFilters;
  onBack: () => void;
}) {
  const availableYears = useAvailableYears();
  const [, navigate] = useLocation();

  const [selectedMonths, setSelectedMonths] = useState<CustomDateValue[]>(
    () => {
      if (filters.date.type === "custom") {
        return filters.date.value;
      }
      return [];
    },
  );

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const isMonthSelected = (year: number, month: number) => {
    return selectedMonths.some((m) => m.year === year && m.month === month);
  };

  const isYearFullySelected = (year: number) => {
    return monthNames.every((_, index) => isMonthSelected(year, index + 1));
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
      // Add all months for this year (remove existing ones first)
      setSelectedMonths((prev) => {
        const withoutThisYear = prev.filter((m) => m.year !== year);
        const allMonthsForYear = monthNames.map((_, index) => ({
          year,
          month: index + 1,
        }));
        return [...withoutThisYear, ...allMonthsForYear];
      });
    }
  };

  const handleApply = () => {
    navigate(
      render(routes.monthlyBreakdownFull, {
        query: {
          filters: {
            accounts: filters.accounts,
            date: {
              type: "custom",
              value: selectedMonths,
            },
          },
        },
        path: {},
      }),
      { replace: true },
    );
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
                {monthNames.map((monthName, index) => {
                  const month = index + 1;
                  const isSelected = isMonthSelected(year, month);

                  return (
                    <label
                      key={month}
                      htmlFor={`${year}-${month}`}
                      className={`flex items-center gap-2 p-3 border-r border-b border-muted hover:bg-muted/50 transition-colors cursor-pointer w-full ${isSelected ? "bg-primary/10" : ""}`}
                    >
                      <Checkbox
                        id={`${year}-${month}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleMonth(year, month)}
                      />
                      <span className="text-sm select-none flex-1">
                        {monthName}
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
          Apply Filters
        </Button>
        <Button size="lg" variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
}
