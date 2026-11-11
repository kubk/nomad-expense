import { useState } from "react";
import { SUPPORTED_CURRENCIES, type Currency } from "api";
import { familyStore } from "@/store/family-store";
import { BaseCurrencySettingStore } from "./base-currency-setting-store";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";
import { ConfirmModal } from "../widgets/confirm-modal";
import { t } from "@/translations/translation-store";

export function BaseCurrencySetting() {
  const [store] = useState(() => new BaseCurrencySettingStore());
  const pendingCurrency = store.pendingCurrency;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t("baseCurrency")}</Label>
        {familyStore.baseCurrencyQuery.isPending ? (
          <div className="h-9 bg-muted animate-pulse rounded-md" />
        ) : (
          <Select
            value={familyStore.baseCurrencyQuery.data}
            onValueChange={(value) => store.selectCurrency(value as Currency)}
            disabled={store.isUpdating}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("baseCurrencySelect")} />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <p className="text-xs text-muted-foreground">
          {t("baseCurrencyDescription")}
        </p>
      </div>

      <ConfirmModal
        isOpen={pendingCurrency !== null}
        onClose={store.cancel}
        onConfirm={store.confirm}
        title={t("baseCurrencyChangeTitle")}
        description={
          <div className="space-y-4">
            <p>
              {t(
                "baseCurrencyChangeDescription",
                SUPPORTED_CURRENCIES.find((c) => c.code === pendingCurrency)
                  ?.name ??
                  pendingCurrency ??
                  "",
              )}
            </p>
            <Alert>
              <AlertTriangleIcon className="size-4" />
              <AlertTitle>{t("baseCurrencySlowTitle")}</AlertTitle>
              <AlertDescription>
                {t("baseCurrencySlowDescription")}
              </AlertDescription>
            </Alert>
          </div>
        }
        confirmText={
          <span className="flex items-center gap-2">
            <RefreshCwIcon className="size-4" />
            {t("baseCurrencyRecalculate")}
          </span>
        }
        isLoading={store.isUpdating}
      />
    </div>
  );
}
