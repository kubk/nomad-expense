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
import { Badge } from "@/components/ui/badge";
import {
  CheckIcon,
  SearchIcon,
  CalendarIcon,
  CreditCardIcon,
  ArrowUpDownIcon,
} from "lucide-react";
import {
  transactionType,
  type TransactionFilters,
  type TransactionType,
} from "api";
import { trpc } from "@/shared/api";
import { useQuery } from "@tanstack/react-query";
import { CustomDatePicker } from "./custom-date-picker";
import { haptic } from "@/shared/platform/haptics";
import { useTranslation } from "@/translations/translation-provider";

type TransactionTypeFilterValue = "all" | TransactionType;

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
  const { t } = useTranslation();
  const [filterForm, setFilterForm] = useState<TransactionFilters>(filters);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const { data: accounts = [] } = useQuery(trpc.accounts.list.queryOptions());

  useEffect(() => {
    setFilterForm(filters);
  }, [filters]);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  const transactionTypeOptions: ReadonlyArray<{
    value: TransactionTypeFilterValue;
    label: string;
  }> = [
    { value: "all", label: t("filtersAll") },
    ...transactionType.map((value) => ({
      value,
      label:
        value === "expense"
          ? t("transactionTypeExpense")
          : t("transactionTypeIncome"),
    })),
  ];

  const timePeriods = [
    { value: 1, label: t("filtersLastDays", 30) },
    { value: 3, label: t("filtersLastDays", 90) },
    { value: 6, label: t("filtersLastMonths", 6) },
  ];

  const handleAccountToggle = (account: string) => {
    haptic("selection");
    setFilterForm((prev) => ({
      ...prev,
      accounts: prev.accounts.includes(account)
        ? prev.accounts.filter((a) => a !== account)
        : [...prev.accounts, account],
    }));
  };

  const handleSelectAllAccounts = () => {
    haptic("selection");
    const allAccountIds = accounts.map((account) => account.id);
    const areAllSelected = allAccountIds.every((id) =>
      filterForm.accounts.includes(id),
    );

    setFilterForm((prev) => ({
      ...prev,
      accounts: areAllSelected ? [] : allAccountIds,
    }));
  };

  const handleMonthsChange = (months: number) => {
    haptic("selection");
    setFilterForm((prev) => ({
      ...prev,
      date: { type: "months", value: months },
    }));
  };

  const handleTransactionTypeChange = (value: TransactionTypeFilterValue) => {
    haptic("selection");
    setFilterForm((prev) => ({
      ...prev,
      transactionType: value === "all" ? undefined : value,
    }));
  };

  const handleApply = (filters: TransactionFilters) => {
    haptic("medium");
    onApply(filters);
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
    haptic("selection");
    setFilterForm((prev) => ({
      ...prev,
      description: prev.description ? { ...prev.description, type } : undefined,
    }));
  };

  const handleBadgeOrderChange = (
    field: "createdAt" | "amount",
    direction: "asc" | "desc",
  ) => {
    haptic("selection");
    setFilterForm((prev) => ({
      ...prev,
      order: { field, direction },
    }));
  };

  const isOrderActive = (
    field: "createdAt" | "amount",
    direction: "asc" | "desc",
  ) => {
    return (
      filterForm.order.field === field &&
      filterForm.order.direction === direction
    );
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
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder={t("filtersSearchPlaceholder")}
                        value={filterForm.description?.input || ""}
                        onChange={(e) =>
                          handleDescriptionChange(e.target.value)
                        }
                        className="pl-9"
                      />
                    </div>
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
                            {t("filtersContains")}
                          </TabsTrigger>
                          <TabsTrigger value="exact" className="flex-1">
                            {t("filtersExact")}
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    )}
                  </div>
                </div>

                <Tabs
                  value={filterForm.transactionType ?? "all"}
                  onValueChange={(value) =>
                    handleTransactionTypeChange(
                      value as TransactionTypeFilterValue,
                    )
                  }
                >
                  <TabsList className="w-full">
                    {transactionTypeOptions.map((option) => (
                      <TabsTrigger
                        key={option.value}
                        value={option.value}
                        className="flex-1"
                      >
                        {option.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="size-4 text-muted-foreground" />
                      <h3 className="font-medium">{t("filtersTimePeriod")}</h3>
                    </div>
                  </div>
                  <div className="flex overflow-x-auto pb-3 gap-2">
                    {timePeriods.map((period) => (
                      <Badge
                        key={period.value}
                        variant={
                          filterForm.date.type === "months" &&
                          filterForm.date.value === period.value
                            ? "default"
                            : "secondary"
                        }
                        onClick={() => handleMonthsChange(period.value)}
                        className="cursor-pointer px-3 py-1.5 text-sm whitespace-nowrap flex-shrink-0 flex items-center gap-2"
                      >
                        {period.label}
                      </Badge>
                    ))}
                    <Badge
                      variant={
                        filterForm.date.type === "custom"
                          ? "default"
                          : "secondary"
                      }
                      onClick={handleShowCustomDatePicker}
                      className="cursor-pointer px-3 py-1.5 text-sm whitespace-nowrap flex-shrink-0 flex items-center gap-2"
                    >
                      {filterForm.date.type === "custom" && (
                        <CheckIcon className="size-3" />
                      )}
                      {t("filtersCustom")}
                    </Badge>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CreditCardIcon className="size-4 text-muted-foreground" />
                      <h3 className="font-medium">
                        {t("filtersBankAccounts")}
                      </h3>
                    </div>
                    {accounts.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSelectAllAccounts}
                        className="text-md h-6 px-2"
                      >
                        {accounts.every((account) =>
                          filterForm.accounts.includes(account.id),
                        )
                          ? t("filtersDeselectAll")
                          : t("filtersSelectAll")}
                      </Button>
                    )}
                  </div>
                  <div className="flex overflow-auto pb-3 gap-2">
                    {accounts.map((account) => (
                      <Badge
                        key={account.id}
                        variant={
                          filterForm.accounts.includes(account.id)
                            ? "default"
                            : "secondary"
                        }
                        onClick={() => handleAccountToggle(account.id)}
                        className="cursor-pointer px-3 py-1.5 text-sm whitespace-nowrap flex-shrink-0 flex items-center gap-2"
                      >
                        {filterForm.accounts.includes(account.id) && (
                          <CheckIcon className="size-3" />
                        )}
                        {account.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ArrowUpDownIcon className="size-4 text-muted-foreground" />
                      <h3 className="font-medium">{t("filtersSortBy")}</h3>
                    </div>
                  </div>
                  <div className="flex overflow-x-auto gap-2 pb-3">
                    <Badge
                      variant={
                        isOrderActive("createdAt", "desc")
                          ? "default"
                          : "secondary"
                      }
                      className="cursor-pointer px-3 py-1.5 text-sm whitespace-nowrap flex-shrink-0"
                      onClick={() =>
                        handleBadgeOrderChange("createdAt", "desc")
                      }
                    >
                      {t("filtersNewestFirst")}
                    </Badge>
                    <Badge
                      variant={
                        isOrderActive("createdAt", "asc")
                          ? "default"
                          : "secondary"
                      }
                      className="cursor-pointer px-3 py-1.5 text-sm whitespace-nowrap flex-shrink-0"
                      onClick={() => handleBadgeOrderChange("createdAt", "asc")}
                    >
                      {t("filtersOldestFirst")}
                    </Badge>
                    <Badge
                      variant={
                        isOrderActive("amount", "desc")
                          ? "default"
                          : "secondary"
                      }
                      className="cursor-pointer px-3 py-1.5 text-sm whitespace-nowrap flex-shrink-0"
                      onClick={() => handleBadgeOrderChange("amount", "desc")}
                    >
                      {t("filtersHighestAmount")}
                    </Badge>
                    <Badge
                      variant={
                        isOrderActive("amount", "asc") ? "default" : "secondary"
                      }
                      className="cursor-pointer px-3 py-1.5 text-sm whitespace-nowrap flex-shrink-0"
                      onClick={() => handleBadgeOrderChange("amount", "asc")}
                    >
                      {t("filtersLowestAmount")}
                    </Badge>
                  </div>
                </div>
              </>
            )}
          </div>

          {!showCustomDatePicker && (
            <DrawerFooter className="flex-row border-t [&_button]:flex-1">
              <DrawerClose asChild>
                <Button size="lg" variant="outline">
                  {t("cancel")}
                </Button>
              </DrawerClose>
              <Button size="lg" onClick={() => handleApply(filterForm)}>
                {t("applyFilters")}
              </Button>
            </DrawerFooter>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
