import { useState } from "react";
import { ChevronDownIcon, ArrowLeftIcon, RepeatIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type RouteByType,
  routerStore,
} from "@/shared/stacked-router/router-store";
import { PageHeader } from "../widgets/page-header";
import { Page } from "../widgets/page";
import { ConfirmModal } from "../widgets/confirm-modal";
import { Footer } from "../widgets/footer";
import { getCurrencySymbol } from "@/shared/currency-formatter";
import { FormActionButton } from "@/components/ui/form-action-button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  makeTransactionQuery,
  UpdateTransactionStore,
} from "./update-transaction-store";
import { CountableSwitch } from "./countable-switch";
import { TransactionTypeTabs } from "./transaction-type-tabs";
import { DeleteActionButton } from "../widgets/delete-action-button";
import { BaseCurrencyInfo } from "./base-currency-info";
import { isTelegram } from "@/shared/platform/telegram-platform";
import { t } from "@/translations/translation-store";
import { CreateTransactionScreen } from "./create-transaction-screen";

export function TransactionFormScreen({
  route,
}: {
  route: RouteByType<"transactionForm">;
}) {
  if (!route.transactionId) {
    return <CreateTransactionScreen route={route} />;
  }

  return <UpdateTransactionScreen transactionId={route.transactionId} />;
}

function UpdateTransactionScreen({ transactionId }: { transactionId: string }) {
  const [transactionQuery] = useState(() =>
    makeTransactionQuery(transactionId),
  );
  const transaction = transactionQuery.data;

  return (
    <UpdateTransactionForm
      key={transaction ? JSON.stringify(transaction) : "loading"}
      transactionId={transactionId}
      transaction={transaction}
    />
  );
}

function UpdateTransactionForm({
  transactionId,
  transaction,
}: {
  transactionId: string;
  transaction: ConstructorParameters<typeof UpdateTransactionStore>[1];
}) {
  const [store] = useState(
    () => new UpdateTransactionStore(transactionId, transaction),
  );
  const isSaving = store.isSaving;
  const isTransactionLoading = !transaction;

  return (
    <Page title={<PageHeader title={t("transactionsEditTitle")} />}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          store.save();
        }}
      >
        <div className="flex-1 flex flex-col">
          <div className="flex-1 space-y-6">
            {/* Transaction Type Selector */}
            <div className="flex flex-col gap-2">
              {isTransactionLoading ? (
                <Skeleton className="h-9 rounded-md w-full" />
              ) : (
                <TransactionTypeTabs
                  value={store.form.type.value}
                  onChange={store.form.type.onChange}
                />
              )}
            </div>

            {/* Amount input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                {t("transactionsAmount")}
              </label>
              <div className="flex gap-3">
                {isTransactionLoading ? (
                  <>
                    <Skeleton className="h-9.5 w-16" />
                  </>
                ) : (
                  <>
                    <Input
                      type="number"
                      inputMode="decimal"
                      enterKeyHint="done"
                      step="0.01"
                      placeholder="0.00"
                      value={store.form.amount.value}
                      onChange={(e) =>
                        store.form.amount.onChange(e.target.value)
                      }
                      className="flex-1"
                    />
                    <div className="text-lg text-muted-foreground min-w-16 flex items-center justify-center">
                      {(() => {
                        const currencyCode = transaction?.currency;
                        if (!currencyCode) return "";
                        const symbol = getCurrencySymbol(currencyCode);
                        return `${symbol} · ${currencyCode}`;
                      })()}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {isTransactionLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Input
                  placeholder={t("transactionsDescriptionPlaceholder")}
                  value={store.form.description.value}
                  onChange={(e) =>
                    store.form.description.onChange(e.target.value)
                  }
                />
              )}
            </div>

            {/* Date/Time picker */}
            <div className="flex gap-4">
              <div className="flex flex-col gap-3 flex-1">
                <Label htmlFor="date-picker" className="px-1">
                  {t("transactionsDate")}
                </Label>
                {isTransactionLoading ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date-picker"
                        type="button"
                        className="justify-between font-normal"
                      >
                        {store.form.date.value
                          ? store.form.date.value.toLocaleDateString()
                          : t("transactionsSelectDate")}
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={store.form.date.value}
                        onSelect={store.form.date.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <div className="flex flex-col gap-3 flex-1">
                <Label htmlFor="time-picker" className="px-1">
                  {t("transactionsTime")}
                </Label>
                {isTransactionLoading ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <Input
                    type="time"
                    id="time-picker"
                    value={store.form.time.value}
                    onChange={(e) => store.form.time.onChange(e.target.value)}
                    className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-4">
              {isTransactionLoading && <Skeleton className="h-11" />}
              {!isTransactionLoading && (
                <div className="flex gap-3">
                  <FormActionButton
                    onClick={store.repeat}
                    icon={<RepeatIcon className="h-4 w-4" />}
                    isLoading={store.repeatMutation.isPending}
                    disabled={isSaving || isTransactionLoading}
                  >
                    {t("transactionsRepeat")}
                  </FormActionButton>
                  <DeleteActionButton
                    onClick={() => store.setDeleteConfirmOpen(true)}
                  />
                </div>
              )}
            </div>

            {store.account?.bankType ? <CountableSwitch store={store} /> : null}

            {transaction ? (
              <BaseCurrencyInfo
                amount={transaction.amount}
                currency={transaction.currency}
                usdAmount={transaction.usdAmount}
              />
            ) : null}
          </div>

          <ConfirmModal
            isOpen={store.isDeleteConfirmOpen}
            onClose={() => store.setDeleteConfirmOpen(false)}
            onConfirm={store.delete}
            title={t("transactionsDeleteTitle")}
            description={t("transactionsDeleteDescription")}
            confirmText={t("delete")}
            isLoading={store.deleteMutation.isPending}
          />
        </div>
        <Footer className={isTelegram() ? "grid-cols-1" : undefined}>
          {!isTelegram() ? (
            <Button
              size={"lg"}
              variant="outline"
              type="button"
              onClick={routerStore.pop}
              disabled={isSaving || isTransactionLoading}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              {t("back")}
            </Button>
          ) : null}
          <Button size="lg" type="submit" disabled={!store.canSave}>
            <LoadingSwap isLoading={isSaving}>{t("save")}</LoadingSwap>
          </Button>
        </Footer>
      </form>
    </Page>
  );
}
