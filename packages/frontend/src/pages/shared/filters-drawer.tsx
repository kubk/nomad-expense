import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckIcon } from "lucide-react";
import { TransactionFilters } from "api";
import { useAvailableYears } from "@/shared/hooks/use-available-years";
import { trpc } from "@/shared/api";
import { useQuery } from "@tanstack/react-query";
import { CustomDatePicker } from "./custom-date-picker";

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
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const availableYears = useAvailableYears();
  const { data: accounts = [] } = useQuery(trpc.accounts.list.queryOptions());

  useEffect(() => {
    setFilterForm(filters);
  }, [filters]);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  const timePeriods = [
    { value: 1, label: "Last 30 days" },
    { value: 3, label: "Last 90 days" },
    { value: 6, label: "Last 6 months" },
    { value: 12, label: "Last year" },
  ];

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

  const handleApply = (filters: TransactionFilters) => {
    onApply(filters);
    onOpenChange(false);
  };

  const handleAllTime = () => {
    const allMonths = availableYears.flatMap((year) =>
      Array.from({ length: 12 }, (_, i) => ({ year, month: i + 1 })),
    );
    onApply({
      ...filterForm,
      date: { type: "custom", value: allMonths },
    });
    onOpenChange(false);
  };

  const handleShowCustomDatePicker = () => {
    setShowCustomDatePicker(true);
  };

  const handleCustomDateBack = () => {
    setShowCustomDatePicker(false);
  };

  const handleDescriptionChange = (value: string) => {
    setFilterForm((prev) => ({
      ...prev,
      description: value.trim()
        ? {
            input: value.trim(),
            type: prev.description?.type || "includes",
          }
        : undefined,
    }));
  };

  const handleDescriptionTypeChange = (type: "includes" | "exact") => {
    setFilterForm((prev) => ({
      ...prev,
      description: prev.description ? { ...prev.description, type } : undefined,
    }));
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="p-2">
            <DrawerTitle />
            <DrawerDescription />
          </DrawerHeader>

          <div className="p-4 pt-0 pb-6 space-y-5">
            {showCustomDatePicker ? (
              <CustomDatePicker
                filters={filterForm}
                onApply={handleApply}
                onBack={handleCustomDateBack}
              />
            ) : (
              <>
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search transactions..."
                      value={filterForm.description?.input || ""}
                      onChange={(e) => handleDescriptionChange(e.target.value)}
                    />
                    {filterForm.description && (
                      <Tabs
                        value={filterForm.description.type}
                        onValueChange={(value) =>
                          handleDescriptionTypeChange(
                            value as "includes" | "exact",
                          )
                        }
                      >
                        <TabsList className="w-full">
                          <TabsTrigger value="includes" className="flex-1">
                            Contains
                          </TabsTrigger>
                          <TabsTrigger value="exact" className="flex-1">
                            Exact
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Time period</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAllTime}
                      className="text-sm h-6 px-2"
                    >
                      All time
                    </Button>
                  </div>
                  <div className="flex overflow-x-auto pb-3 gap-2">
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
                    <Button
                      variant={
                        filterForm.date.type === "custom"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={handleShowCustomDatePicker}
                      className="h-8 px-3 text-xs flex items-center gap-2"
                    >
                      {filterForm.date.type === "custom" && (
                        <CheckIcon className="size-3" />
                      )}
                      Custom
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Bank accounts</h3>
                  </div>
                  <div className="flex overflow-x-visible pb-3 gap-2">
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
              </>
            )}
          </div>

          {!showCustomDatePicker && (
            <DrawerFooter className="flex-row [&_button]:flex-1">
              <DrawerClose asChild>
                <Button size="lg" variant="outline">
                  Cancel
                </Button>
              </DrawerClose>
              <Button size="lg" onClick={() => handleApply(filterForm)}>
                Apply filters
              </Button>
            </DrawerFooter>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
