import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { MonthlyData } from "../../shared/types";
import { accounts } from "@/shared/data";

export function FiltersDrawer({
  open,
  onOpenChange,
  monthlyData,
  appliedFilters,
  onApplyFilters,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monthlyData: MonthlyData[];
  appliedFilters: { years: number[]; accounts: string[]; months: number };
  onApplyFilters: (filters: {
    years: number[];
    accounts: string[];
    months: number;
  }) => void;
}) {
  const [selectedYears, setSelectedYears] = useState<number[]>(
    appliedFilters.years,
  );
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(
    appliedFilters.accounts.length === 0
      ? accounts.map((a) => a.id)
      : appliedFilters.accounts,
  );
  const [selectedMonths, setSelectedMonths] = useState<number>(
    appliedFilters.months,
  );

  // Reset selections to applied filters when drawer opens/closes
  const resetToAppliedFilters = () => {
    setSelectedYears(appliedFilters.years);
    setSelectedAccounts(
      appliedFilters.accounts.length === 0
        ? accounts.map((a) => a.id)
        : appliedFilters.accounts,
    );
    setSelectedMonths(appliedFilters.months);
  };

  // Handle drawer close - reset to applied filters
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetToAppliedFilters();
    }
    onOpenChange(newOpen);
  };

  const availableYears = [...new Set(monthlyData.map((m) => m.year))].sort(
    (a, b) => b - a,
  );

  const timePeriods = [
    { value: 1, label: "Last month" },
    { value: 3, label: "Last 3 months" },
    { value: 6, label: "Last 6 months" },
    { value: 12, label: "Last year" },
  ];

  const handleYearToggle = (year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year],
    );
  };

  const handleAccountToggle = (account: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(account)
        ? prev.filter((a) => a !== account)
        : [...prev, account],
    );
  };

  const handleMonthsChange = (months: number) => {
    setSelectedMonths(months);
    // Clear year selection when using months filter
    if (months > 0) {
      setSelectedYears([]);
    }
  };

  const handleApply = () => {
    // If all accounts are selected, pass empty array to indicate "all"
    const accountsToSend =
      selectedAccounts.length === accounts.length ? [] : selectedAccounts;
    // If all years are selected and no month filter, pass empty array to indicate "all"
    const yearsToSend =
      selectedYears.length === availableYears.length && selectedMonths === 0
        ? []
        : selectedYears;

    onApplyFilters({
      years: yearsToSend,
      accounts: accountsToSend,
      months: selectedMonths,
    });
    onOpenChange(false);
  };

  const handleAllTime = () => {
    setSelectedMonths(0);
    setSelectedYears([]);
  };

  const handleSelectAllAccounts = () => {
    setSelectedAccounts(accounts.map((a) => a.id));
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle />
            <DrawerDescription />
          </DrawerHeader>

          <div className="p-4 pt-0 pb-0 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Time Period</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAllTime}
                  className="text-xs h-6 px-2"
                >
                  All time
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {timePeriods.map((period) => (
                  <Button
                    key={period.value}
                    variant={
                      selectedMonths === period.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      handleMonthsChange(
                        selectedMonths === period.value ? 0 : period.value,
                      )
                    }
                    className="h-8 px-3 text-xs flex items-center gap-2 transition-none"
                  >
                    {selectedMonths === period.value && (
                      <CheckIcon className="size-3" />
                    )}
                    {period.label}
                  </Button>
                ))}
                {availableYears.map((year) => (
                  <Button
                    key={year}
                    variant={
                      selectedYears.includes(year) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => {
                      handleYearToggle(year);
                      if (!selectedYears.includes(year)) {
                        setSelectedMonths(0);
                      }
                    }}
                    className="h-8 px-3 text-xs flex items-center gap-2"
                  >
                    {selectedYears.includes(year) && (
                      <CheckIcon className="size-3" />
                    )}
                    {year}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Bank Accounts</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllAccounts}
                  className="text-xs h-6 px-2"
                >
                  All accounts
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {accounts.map((account) => (
                  <Button
                    key={account.id}
                    variant={
                      selectedAccounts.includes(account.id)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleAccountToggle(account.id)}
                    className="h-8 px-3 text-xs flex items-center gap-2 transition-none"
                  >
                    {selectedAccounts.includes(account.id) && (
                      <CheckIcon className="size-3" />
                    )}
                    {account.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DrawerFooter>
            <Button size="lg" onClick={handleApply}>
              Apply Filters
            </Button>
            <DrawerClose asChild>
              <Button size="lg" variant="outline">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
