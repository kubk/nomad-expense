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
import { CustomDatePicker } from "./custom-date-picker";
import { FiltersFormStore, type FiltersState } from "./filters-form-store";
import { accountsStore } from "@/store/accounts-store";
import { t } from "@/translations/translation-store";
import { cn } from "@/lib/utils";

type TransactionTypeFilterValue = "all" | TransactionType;
type TransactionOrderField = TransactionFilters["order"]["field"];
type TransactionOrderDirection = TransactionFilters["order"]["direction"];

export function FiltersDrawer({ target }: { target: FiltersState }) {
  return (
    <FiltersDrawerContent
      key={JSON.stringify(target.filters)}
      target={target}
    />
  );
}

function FiltersDrawerContent({ target }: { target: FiltersState }) {
  const [store] = useState(() => new FiltersFormStore(target));
  const { form } = store;
  const accounts = accountsStore.accounts;

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
    { value: 30, label: t("filtersLastDaysShort", 30) },
    { value: 90, label: t("filtersLastDaysShort", 90) },
  ];

  const sortOptions: ReadonlyArray<{
    field: TransactionOrderField;
    direction: TransactionOrderDirection;
    label: string;
  }> = [
    {
      field: "createdAt",
      direction: "desc",
      label: t("filtersNewestFirst"),
    },
    {
      field: "createdAt",
      direction: "asc",
      label: t("filtersOldestFirst"),
    },
    {
      field: "amount",
      direction: "desc",
      label: t("filtersHighestAmount"),
    },
    {
      field: "amount",
      direction: "asc",
      label: t("filtersLowestAmount"),
    },
  ];

  const getChipClassName = (isActive: boolean) =>
    cn(
      "cursor-pointer px-3 py-1.5 text-sm whitespace-nowrap flex-shrink-0 flex items-center gap-2",
      !isActive &&
        "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
    );

  const getChipVariant = (isActive: boolean) =>
    isActive ? "default" : "secondary";

  return (
    <Drawer open={target.isFiltersOpen} onOpenChange={store.setOpen}>
      <DrawerContent
        className={
          store.isCustomDatePickerOpen
            ? "h-[calc(100dvh-8rem)] data-[vaul-drawer-direction=bottom]:max-h-[calc(100dvh-8rem)]"
            : undefined
        }
      >
        <div
          className={cn(
            "mx-auto flex min-h-0 w-full flex-1 flex-col",
            !store.isCustomDatePickerOpen && "max-w-sm",
          )}
        >
          <DrawerHeader className="sr-only">
            <DrawerTitle>{t("filtersTimePeriod")}</DrawerTitle>
            <DrawerDescription />
          </DrawerHeader>

          {store.isCustomDatePickerOpen ? (
            <CustomDatePicker store={store} />
          ) : (
            <div className="min-h-0 overflow-y-auto p-4 pb-6 space-y-5">
              <div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={t("filtersSearchPlaceholder")}
                      value={form.description.value}
                      onChange={(e) =>
                        form.description.onChange(e.target.value)
                      }
                      className="pl-9"
                    />
                  </div>
                  {form.description.value.trim() && (
                    <Tabs
                      value={form.descriptionType.value}
                      onValueChange={(value) =>
                        form.descriptionType.onChange(
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
                value={form.transactionType.value ?? "all"}
                onValueChange={(value) =>
                  form.transactionType.onChange(
                    value === "all" ? undefined : (value as TransactionType),
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
                  <Badge
                    asChild
                    variant={getChipVariant(form.date.value.type === "all")}
                    className={getChipClassName(form.date.value.type === "all")}
                    onClick={() => form.date.onChange({ type: "all" })}
                  >
                    <button type="button">{t("filtersAllTime")}</button>
                  </Badge>
                  {timePeriods.map((period) => {
                    const isActive =
                      form.date.value.type === "days" &&
                      form.date.value.value === period.value;
                    return (
                      <Badge
                        asChild
                        key={period.value}
                        variant={getChipVariant(isActive)}
                        onClick={() =>
                          form.date.onChange({
                            type: "days",
                            value: period.value,
                          })
                        }
                        className={getChipClassName(isActive)}
                      >
                        <button type="button">{period.label}</button>
                      </Badge>
                    );
                  })}
                  <Badge
                    asChild
                    variant={getChipVariant(form.date.value.type === "range")}
                    onClick={store.openCustomDatePicker}
                    className={getChipClassName(
                      form.date.value.type === "range",
                    )}
                  >
                    <button type="button">{t("filtersCustom")}</button>
                  </Badge>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CreditCardIcon className="size-4 text-muted-foreground" />
                    <h3 className="font-medium">
                      {t("filtersBankAccounts")}
                      <span className="ml-1 text-sm font-normal text-muted-foreground">
                        · {store.selectedAccountCount}
                      </span>
                    </h3>
                  </div>
                  {accounts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={store.toggleAllAccounts}
                      className="text-md h-6 px-2 text-muted-foreground hover:text-foreground"
                    >
                      {store.areAllAccountsSelected
                        ? t("filtersDeselectAll")
                        : t("filtersSelectAll")}
                    </Button>
                  )}
                </div>
                <div className="flex overflow-auto pb-3 gap-2">
                  {accounts.map((account) => {
                    const isActive = store.isAccountSelected(account.id);

                    return (
                      <Badge
                        key={account.id}
                        variant={getChipVariant(isActive)}
                        onClick={() => store.toggleAccount(account.id)}
                        className={getChipClassName(isActive)}
                      >
                        {isActive && <CheckIcon className="size-3" />}
                        {account.name}
                      </Badge>
                    );
                  })}
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
                  {sortOptions.map((option) => {
                    const isActive = store.isOrderActive(option);

                    return (
                      <Badge
                        key={`${option.field}-${option.direction}`}
                        variant={getChipVariant(isActive)}
                        className={getChipClassName(isActive)}
                        onClick={() =>
                          form.order.onChange({
                            field: option.field,
                            direction: option.direction,
                          })
                        }
                      >
                        {option.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {!store.isCustomDatePickerOpen && (
            <DrawerFooter className="flex-row border-t [&_button]:flex-1">
              <DrawerClose asChild>
                <Button size="lg" variant="outline">
                  {t("cancel")}
                </Button>
              </DrawerClose>
              <Button size="lg" onClick={store.apply}>
                {t("applyFilters")}
              </Button>
            </DrawerFooter>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
