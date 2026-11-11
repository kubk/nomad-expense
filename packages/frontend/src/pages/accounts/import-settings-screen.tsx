import { useState } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Page } from "../widgets/page";
import { Footer } from "../widgets/footer";
import { accountsStore } from "@/store/accounts-store";
import { ImportSettingsStore } from "./import-settings-store";
import {
  type RouteByType,
  routerStore,
} from "@/shared/stacked-router/router-store";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { bank, type Account, type Bank } from "api";
import { isTelegram } from "@/shared/platform/telegram-platform";
import { t } from "@/translations/translation-store";

function getTimezones() {
  return [
    { value: "UTC", label: "UTC+0 - London, Dublin" },
    { value: "Europe/Berlin", label: "UTC+1 - Berlin, Paris" },
    { value: "Europe/Athens", label: "UTC+2 - Athens, Cairo" },
    { value: "Europe/Moscow", label: "UTC+3 - Moscow, Istanbul" },
    { value: "Asia/Dubai", label: "UTC+4 - Dubai" },
    { value: "Asia/Kolkata", label: "UTC+5:30 - Mumbai, Delhi" },
    { value: "Asia/Dhaka", label: "UTC+6 - Dhaka" },
    { value: "Asia/Bangkok", label: "UTC+7 - Bangkok, Jakarta" },
    { value: "Asia/Shanghai", label: "UTC+8 - Beijing, Singapore" },
    { value: "Asia/Tokyo", label: "UTC+9 - Tokyo, Seoul" },
    { value: "Australia/Sydney", label: "UTC+10 - Sydney, Melbourne" },
    { value: "Pacific/Auckland", label: "UTC+12 - Auckland" },
    { value: "America/Sao_Paulo", label: "UTC-3 - São Paulo" },
    { value: "America/New_York", label: "UTC-5 - New York, Toronto" },
    { value: "America/Chicago", label: "UTC-6 - Chicago" },
    { value: "America/Denver", label: "UTC-7 - Denver" },
    { value: "America/Los_Angeles", label: "UTC-8 - Los Angeles" },
  ];
}

export function ImportSettingsScreen({
  route,
}: {
  route: RouteByType<"importSettings">;
}) {
  const isAccountsLoading = accountsStore.isLoading;
  const existingAccount = accountsStore.findAccount(route.accountId);

  if (!isAccountsLoading && !existingAccount) {
    return null;
  }

  return (
    <ImportSettingsForm
      key={
        existingAccount
          ? JSON.stringify([
              existingAccount.id,
              existingAccount.bankType,
              existingAccount.timezone,
            ])
          : "loading"
      }
      route={route}
      existingAccount={existingAccount}
      isAccountsLoading={isAccountsLoading}
    />
  );
}

function ImportSettingsForm({
  route,
  existingAccount,
  isAccountsLoading,
}: {
  route: RouteByType<"importSettings">;
  existingAccount?: Account;
  isAccountsLoading: boolean;
}) {
  const [store] = useState(
    () => new ImportSettingsStore(route.accountId, existingAccount),
  );
  const isSaving = store.updateMutation.isPending;

  return (
    <Page title={t("importSettingsTitle")}>
      <div className="flex-1 space-y-6">
        <div className="flex flex-col gap-2">
          <Label>{t("importSettingsBankType")}</Label>
          {isAccountsLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select
              value={store.form.bankType.value}
              onValueChange={(value: Bank | "None") =>
                store.form.bankType.onChange(value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("importSettingsSelectBankType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">{t("none")}</SelectItem>
                {bank.map((bankType) => (
                  <SelectItem key={bankType} value={bankType}>
                    {bankType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {store.form.bankType.value !== "None" && (
          <div className="flex flex-col gap-2">
            <Label>{t("importSettingsTimezone")}</Label>
            <Select
              value={store.form.timezone.value}
              onValueChange={store.form.timezone.onChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("importSettingsSelectTimezone")} />
              </SelectTrigger>
              <SelectContent>
                {getTimezones().map((timezone) => (
                  <SelectItem key={timezone.value} value={timezone.value}>
                    {timezone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Footer className={isTelegram() ? "grid-cols-1" : undefined}>
        {!isTelegram() ? (
          <Button
            size="lg"
            variant="outline"
            type="button"
            onClick={routerStore.pop}
            disabled={isSaving}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            {t("back")}
          </Button>
        ) : null}
        <Button
          size="lg"
          type="button"
          onClick={store.save}
          disabled={isSaving}
        >
          <LoadingSwap isLoading={isSaving}>{t("save")}</LoadingSwap>
        </Button>
      </Footer>
    </Page>
  );
}
