import { useState } from "react";
import { DeleteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrencySymbol } from "@/shared/currency-formatter";
import { accountsStore } from "@/store/accounts-store";
import { CreateTransactionStore } from "./create-transaction-store";
import { isTelegram } from "@/shared/platform/telegram-platform";
import type { RouteByType } from "@/shared/stacked-router/router-store";
import { t } from "@/translations/translation-store";
import { NoAccountsEmptyState } from "../widgets/no-accounts-empty-state";
import { Page } from "../widgets/page";
import { PageHeader } from "../widgets/page-header";
import { Footer } from "../widgets/footer";
import { QuickTitles } from "./quick-titles";
import { UploadStatementButton } from "./upload-statement-button";
import { AccountPickerDrawer } from "./account-picker-drawer";
import { TransactionTypeTabs } from "./transaction-type-tabs";

const keypadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"];

function getAmountTextSize(amount: string) {
  const characterCount = Math.max(amount.length, 1);

  if (characterCount <= 4) return "text-7xl";
  if (characterCount <= 7) return "text-6xl";
  if (characterCount <= 10) return "text-5xl";
  return "text-4xl";
}

export function CreateTransactionScreen({
  route,
}: {
  route: RouteByType<"transactionForm">;
}) {
  const [store] = useState(() => new CreateTransactionStore(route.accountId));
  const selectedAccount = store.selectedAccount;
  const areAccountsLoaded = store.areAccountsLoaded;
  const canUploadStatement = Boolean(selectedAccount?.bankType);

  if (!accountsStore.isLoading && accountsStore.accounts.length === 0) {
    return (
      <Page title={!isTelegram() ? <PageHeader /> : undefined}>
        <div className="mt-[25%]">
          <NoAccountsEmptyState />
        </div>
      </Page>
    );
  }

  return (
    <Page title={!isTelegram() ? <PageHeader /> : undefined}>
      <form
        className="flex h-full min-h-0 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          store.save();
        }}
      >
        <div className="flex shrink-0 items-center gap-2">
          <TransactionTypeTabs
            className="min-w-0 flex-1"
            value={store.form.type.value}
            onChange={store.form.type.onChange}
          />

          {selectedAccount && canUploadStatement ? (
            <UploadStatementButton accountId={selectedAccount.id} />
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="flex min-h-38 flex-1 flex-col items-center justify-center px-2 py-3">
            <div
              className="flex min-h-16 max-w-full flex-nowrap items-baseline justify-center gap-2"
              role="status"
            >
              <span
                className={`${getAmountTextSize(store.form.amount.value)} whitespace-nowrap font-semibold tabular-nums tracking-tight`}
              >
                {store.form.amount.value || "0"}
              </span>
              <span className="min-w-6 shrink-0 whitespace-nowrap text-2xl font-medium text-muted-foreground">
                {areAccountsLoaded && selectedAccount ? (
                  getCurrencySymbol(selectedAccount.currency)
                ) : (
                  <span className="invisible">$</span>
                )}
              </span>
            </div>

            {!areAccountsLoaded || !selectedAccount ? (
              <Skeleton className="mt-3 h-11 w-48 shrink-0 rounded-full" />
            ) : (
              <div className="mt-3 flex max-w-full shrink-0 items-center gap-2">
                <AccountPickerDrawer
                  accounts={accountsStore.accounts}
                  selectedAccount={selectedAccount}
                  onSelect={store.form.accountId.onChange}
                />
              </div>
            )}
          </div>

          <div className="shrink-0 space-y-3">
            <Input
              className="h-12 rounded-xl border-none px-4 shadow-sm"
              placeholder={t("transactionsDescriptionPlaceholder")}
              value={store.form.description.value}
              onChange={(event) =>
                store.form.description.onChange(event.target.value)
              }
            />

            <QuickTitles
              titles={store.titles}
              isLoading={!store.areTitlesLoaded}
              onTitleClick={store.form.description.onChange}
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-col pb-3 pt-4">
          <div className="grid grid-cols-3 gap-2">
            {keypadKeys.map((key) => (
              <Button
                key={key}
                className="h-13 rounded-2xl bg-card text-xl shadow-sm hover:bg-card"
                onClick={() => store.pressKey(key)}
                type="button"
                variant="ghost"
              >
                {key}
              </Button>
            ))}
            <Button
              className="h-13 rounded-2xl bg-card shadow-sm hover:bg-card"
              disabled={!store.form.amount.value}
              onClick={store.backspace}
              type="button"
              variant="ghost"
            >
              <DeleteIcon className="size-5" />
            </Button>
          </div>
        </div>

        <Footer className="grid-cols-1">
          <Button disabled={!store.canSubmit} size="lg" type="submit">
            <LoadingSwap isLoading={store.createMutation.isPending}>
              {t("transactionsAddAction")}
            </LoadingSwap>
          </Button>
        </Footer>
      </form>
    </Page>
  );
}
