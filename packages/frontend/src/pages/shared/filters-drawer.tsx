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
import { TransactionFilters } from "api";
import { useAccountIds } from "@/shared/hooks/use-account-ids";
import { useAvailableYears } from "@/shared/hooks/use-available-years";
import { api } from "@/api";

export function FiltersDrawer({
  open,
  onOpenChange,
  filters,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: TransactionFilters;
  onApply: (filters: TransactionFilters) => void;
}) {
  const [filterForm, setFilterForm] = useState<TransactionFilters>(filters);
  const accountIds = useAccountIds();
  const availableYears = useAvailableYears();
  const { data: accounts = [] } = api.accounts.list.useQuery();

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setFilterForm(filters);
    }
    onOpenChange(newOpen);
  };

  const timePeriods = [
    { value: 1, label: "Last month" },
    { value: 3, label: "Last 3 months" },
    { value: 6, label: "Last 6 months" },
    { value: 12, label: "Last year" },
  ];

  const handleYearToggle = (year: number) => {
    setFilterForm((prev) => {
      if (prev.date.type === "years") {
        const currentYears = prev.date.value;
        const newYears = currentYears.includes(year)
          ? currentYears.filter((y) => y !== year)
          : [...currentYears, year];
        return {
          ...prev,
          date: { type: "years", value: newYears },
        };
      }
      return {
        ...prev,
        date: { type: "years", value: [year] },
      };
    });
  };

  const handleAccountToggle = (account: string) => {
    setFilterForm((prev) => ({
      ...prev,
      accounts: prev.accounts.includes(account)
        ? prev.accounts.filter((a) => a !== account)
        : [...prev.accounts, account],
    }));
  };

  const handleMonthsChange = (months: number) => {
    setFilterForm((prev) => ({
      ...prev,
      date: { type: "months", value: months },
    }));
  };

  const handleApply = () => {
    onApply(filterForm);
    onOpenChange(false);
  };

  const handleAllTime = () => {
    setFilterForm((prev) => ({
      ...prev,
      date: { type: "years", value: availableYears },
    }));
  };

  const handleSelectAllAccounts = () => {
    setFilterForm((prev) => ({
      ...prev,
      accounts: accountIds,
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
                      filterForm.date.type === "months" &&
                      filterForm.date.value === period.value
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleMonthsChange(period.value)}
                    className="h-8 px-3 text-xs flex items-center gap-2 transition-none"
                  >
                    {filterForm.date.type === "months" &&
                      filterForm.date.value === period.value && (
                        <CheckIcon className="size-3" />
                      )}
                    {period.label}
                  </Button>
                ))}
                {availableYears.map((year) => (
                  <Button
                    key={year}
                    variant={
                      filterForm.date.type === "years" &&
                      filterForm.date.value.includes(year)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleYearToggle(year)}
                    className="h-8 px-3 text-xs flex items-center gap-2"
                  >
                    {filterForm.date.type === "years" &&
                      filterForm.date.value.includes(year) && (
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
                      filterForm.accounts.includes(account.id)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleAccountToggle(account.id)}
                    className="h-8 px-3 text-xs flex items-center gap-2 transition-none"
                  >
                    {filterForm.accounts.includes(account.id) && (
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
