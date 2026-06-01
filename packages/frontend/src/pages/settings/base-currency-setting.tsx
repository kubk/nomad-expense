import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SUPPORTED_CURRENCIES, type Currency } from "api";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangleIcon, LoaderIcon, RefreshCwIcon } from "lucide-react";
import { trpc, queryClient } from "@/shared/api";
import { ConfirmModal } from "../widgets/confirm-modal";
import { toast } from "sonner";
import { haptic } from "@/shared/platform/haptics";
import { useTranslation } from "@/translations/translation-provider";

export function BaseCurrencySetting() {
  const { t } = useTranslation();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState<Currency | null>(null);

  const { data: currentCurrency, isLoading } = useQuery(
    trpc.family.getBaseCurrency.queryOptions(),
  );

  const updateCurrencyMutation = useMutation(
    trpc.family.updateBaseCurrency.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.family.getBaseCurrency.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.expenses.overview.pathKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.expenses.transactionsByMonth.queryKey(),
        });
        setShowConfirmModal(false);
        setPendingCurrency(null);
      },
      onError: (error) => {
        toast.error(error.message || t("baseCurrencyUpdateFailed"));
      },
    }),
  );

  const handleCurrencyChange = (value: string) => {
    haptic("selection");
    setPendingCurrency(value as Currency);
    setShowConfirmModal(true);
  };

  const handleConfirmChange = async () => {
    if (!pendingCurrency) return;

    await updateCurrencyMutation.mutateAsync({
      baseCurrency: pendingCurrency,
    });
  };

  const handleCancelChange = () => {
    setShowConfirmModal(false);
    setPendingCurrency(null);
  };

  const isUpdating = updateCurrencyMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t("baseCurrency")}</Label>
        {isLoading ? (
          <div className="h-9 bg-muted animate-pulse rounded-md" />
        ) : (
          <Select
            value={currentCurrency}
            onValueChange={handleCurrencyChange}
            disabled={isUpdating}
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
        isOpen={showConfirmModal}
        onClose={handleCancelChange}
        onConfirm={handleConfirmChange}
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
          isUpdating ? (
            <span className="flex items-center gap-2">
              <LoaderIcon className="size-4 animate-spin" />
              {t("baseCurrencyRecalculating")}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <RefreshCwIcon className="size-4" />
              {t("baseCurrencyRecalculate")}
            </span>
          )
        }
        isLoading={isUpdating}
      />
    </div>
  );
}
