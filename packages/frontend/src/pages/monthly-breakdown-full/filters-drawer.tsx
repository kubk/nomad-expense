import { useState } from "react";
import { useLocation } from "wouter";
import { render } from "typesafe-routes";
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
import { MonthlyBreakdownFilters, MonthlyData } from "../../shared/types";
import { expenseStore } from "@/store/expense-store";
import { routes } from "../../routes";

export function FiltersDrawer({
  open,
  onOpenChange,
  monthlyData,
  appliedFilters,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monthlyData: MonthlyData[];
  appliedFilters: MonthlyBreakdownFilters;
}) {
  const [, navigate] = useLocation();
  const [filters, setFilters] =
    useState<MonthlyBreakdownFilters>(appliedFilters);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setFilters(appliedFilters);
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
    setFilters((prev) => ({
      ...prev,
      years: prev.years.includes(year)
        ? prev.years.filter((y) => y !== year)
        : [...prev.years, year],
    }));
  };

  const handleAccountToggle = (account: string) => {
    setFilters((prev) => ({
      ...prev,
      accounts: prev.accounts.includes(account)
        ? prev.accounts.filter((a) => a !== account)
        : [...prev.accounts, account],
    }));
  };

  const handleMonthsChange = (months: number) => {
    setFilters((prev) => ({
      ...prev,
      months,
      // Clear year selection when using months filter
      years: months > 0 ? [] : prev.years,
    }));
  };

  const handleApply = () => {
    navigate(
      render(routes.monthlyBreakdownFull, {
        query: {
          accounts: filters.accounts.join(","),
          years: filters.years.join(","),
          months: filters.months,
        },
        path: {},
      }),
    );
    onOpenChange(false);
  };

  const handleAllTime = () => {
    setFilters((prev) => ({
      ...prev,
      months: 0,
      years: availableYears,
    }));
  };

  const handleSelectAllAccounts = () => {
    setFilters((prev) => ({
      ...prev,
      accounts: expenseStore.accounts.map((a) => a.id),
    }));
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
                      filters.months === period.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      handleMonthsChange(
                        filters.months === period.value ? 0 : period.value,
                      )
                    }
                    className="h-8 px-3 text-xs flex items-center gap-2 transition-none"
                  >
                    {filters.months === period.value && (
                      <CheckIcon className="size-3" />
                    )}
                    {period.label}
                  </Button>
                ))}
                {availableYears.map((year) => (
                  <Button
                    key={year}
                    variant={
                      filters.years.includes(year) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => {
                      handleYearToggle(year);
                      if (!filters.years.includes(year)) {
                        setFilters((prev) => ({ ...prev, months: 0 }));
                      }
                    }}
                    className="h-8 px-3 text-xs flex items-center gap-2"
                  >
                    {filters.years.includes(year) && (
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
                {expenseStore.accounts.map((account) => (
                  <Button
                    key={account.id}
                    variant={
                      filters.accounts.includes(account.id)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleAccountToggle(account.id)}
                    className="h-8 px-3 text-xs flex items-center gap-2 transition-none"
                  >
                    {filters.accounts.includes(account.id) && (
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
