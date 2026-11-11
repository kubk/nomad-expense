import { useState, useEffect } from "react";
import {
  CheckIcon,
  ListPlusIcon,
  ArrowLeftIcon,
  PlusIcon,
  WrenchIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Page } from "../widgets/page";
import { ConfirmModal } from "../widgets/confirm-modal";
import { Footer } from "../widgets/footer";
import { accountsStore } from "@/store/accounts-store";
import { AccountFormStore } from "./account-form-store";
import { cn } from "@/lib/utils";
import {
  SUPPORTED_CURRENCIES,
  type Account,
  type SupportedCurrency,
} from "api";
import { accountColorsPalette } from "./account-colors";
import {
  type RouteByType,
  routerStore,
} from "@/shared/stacked-router/router-store";
import { Label } from "@/components/ui/label";
import { FormActionButton } from "@/components/ui/form-action-button";
import { DeleteActionButton } from "../widgets/delete-action-button";
import { isTelegram } from "@/shared/platform/telegram-platform";
import { t } from "@/translations/translation-store";

export function AccountFormScreen({
  route,
}: {
  route: RouteByType<"accountForm">;
}) {
  const existingAccount = accountsStore.findAccount(route.accountId);

  return (
    <AccountFormContent
      key={existingAccount ? JSON.stringify(existingAccount) : "new"}
      route={route}
      existingAccount={existingAccount}
    />
  );
}

function AccountFormContent({
  route,
  existingAccount,
}: {
  route: RouteByType<"accountForm">;
  existingAccount?: Account;
}) {
  const accountId = route.accountId;
  const isEdit = Boolean(accountId);

  const [store] = useState(() => new AccountFormStore(existingAccount));

  const existingAccountColor = existingAccount?.color;

  useEffect(() => {
    if (!existingAccountColor) return;

    const timeoutId = setTimeout(() => {
      const element = document.getElementById(`color-${existingAccountColor}`);
      element?.scrollIntoView({ inline: "center" });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [existingAccountColor]);

  const handleTransactionsClick = () => {
    if (!accountId) return;

    routerStore.navigate({
      type: "transactions",
      filters: {
        accounts: [accountId],
        date: { type: "days", value: 90 },
        order: { field: "createdAt", direction: "desc" },
      },
    });
  };

  const handleImportClick = () => {
    if (!accountId) return;

    routerStore.navigate({ type: "importSettings", accountId });
  };

  const handleCreateTransactionClick = () => {
    if (!accountId) return;

    routerStore.navigate({ type: "transactionForm", accountId });
  };

  const isLoading = store.isSaving;

  return (
    <Page title={isEdit ? t("accountsEditTitle") : t("accountsAddTitle")}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          store.save();
        }}
      >
        <div className="flex-1 space-y-6">
          <div className="flex flex-col gap-2">
            <Label>{t("accountsName")}</Label>
            <Input
              placeholder={t("accountsNamePlaceholder")}
              value={store.form.name.value}
              onChange={(e) => store.form.name.onChange(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("accountsColor")}</Label>
            <div
              className={cn(
                "flex gap-3 p-3 -mr-4 bg-card shadow-xs rounded-l-xl",
                "overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
              )}
            >
              {accountColorsPalette.map((color) => (
                <button
                  tabIndex={-1}
                  key={color.id}
                  id={`color-${color.id}`}
                  type="button"
                  className="relative w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center"
                  onClick={() => store.form.color.onChange(color.id)}
                >
                  <div
                    className={cn("absolute inset-0 rounded-lg", color.bg)}
                  />
                  {store.form.color.value === color.id && (
                    <CheckIcon
                      strokeWidth={4}
                      className={cn("w-5 h-5 relative", color.text)}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {!isEdit && (
            <div className="flex flex-col gap-3">
              <Label>{t("accountsCurrency")}</Label>
              <Select
                value={store.form.currency.value}
                onValueChange={(value) =>
                  store.form.currency.onChange(value as SupportedCurrency)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(() => {
                      const currency = SUPPORTED_CURRENCIES.find(
                        (c) => c.code === store.form.currency.value,
                      );
                      return currency
                        ? `(${currency.symbol}) ${currency.code}`
                        : store.form.currency.value;
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      ({currency.symbol}) {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isEdit && accountId && (
            <div className="flex flex-col gap-1.5 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <FormActionButton
                  onClick={handleCreateTransactionClick}
                  icon={<PlusIcon className="h-4 w-4" />}
                >
                  {t("accountsTransaction")}
                </FormActionButton>
                <FormActionButton
                  onClick={handleTransactionsClick}
                  icon={<ListPlusIcon className="h-4 w-4" />}
                >
                  {t("accountsTransactions")}
                </FormActionButton>
                <FormActionButton
                  onClick={handleImportClick}
                  icon={<WrenchIcon className="h-4 w-4" />}
                >
                  {t("accountsAdvanced")}
                </FormActionButton>
                <DeleteActionButton
                  onClick={() => store.setDeleteConfirmOpen(true)}
                />
              </div>
            </div>
          )}
        </div>

        <ConfirmModal
          isOpen={store.isDeleteConfirmOpen}
          onClose={() => store.setDeleteConfirmOpen(false)}
          onConfirm={store.delete}
          title={t("accountsDeleteTitle")}
          description={t("accountsDeleteDescription")}
          confirmText={t("delete")}
          isLoading={store.deleteMutation.isPending}
        />

        <Footer className={isTelegram() ? "grid-cols-1" : undefined}>
          {!isTelegram() ? (
            <Button
              size="lg"
              variant="outline"
              type="button"
              onClick={routerStore.pop}
              disabled={isLoading}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              {t("back")}
            </Button>
          ) : null}
          <Button
            size="lg"
            type="submit"
            disabled={!store.isValid || isLoading}
          >
            <LoadingSwap isLoading={isLoading}>{t("save")}</LoadingSwap>
          </Button>
        </Footer>
      </form>
    </Page>
  );
}
