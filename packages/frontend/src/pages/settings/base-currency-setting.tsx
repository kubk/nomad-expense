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

export function BaseCurrencySetting() {
  const [showRecalculateModal, setShowRecalculateModal] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState<Currency | null>(null);

  const { data: currentCurrency, isLoading } = useQuery(
    trpc.family.getBaseCurrency.queryOptions(),
  );

  const updateCurrencyMutation = useMutation(
    trpc.family.updateBaseCurrency.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["family", "getBaseCurrency"],
        });
      },
    }),
  );

  const recalculateMutation = useMutation(
    trpc.family.recalculateTransactions.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        setShowRecalculateModal(false);
        setPendingCurrency(null);
      },
    }),
  );

  const handleCurrencyChange = (value: string) => {
    setPendingCurrency(value as Currency);
    setShowRecalculateModal(true);
  };

  const handleConfirmChange = async () => {
    if (!pendingCurrency) return;

    await updateCurrencyMutation.mutateAsync({
      baseCurrency: pendingCurrency,
    });

    await recalculateMutation.mutateAsync();
  };

  const handleCancelChange = () => {
    setShowRecalculateModal(false);
    setPendingCurrency(null);
  };

  const isUpdating =
    updateCurrencyMutation.isPending || recalculateMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Base currency</Label>
        <div className="h-9 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Base currency</Label>
        <Select
          value={currentCurrency}
          onValueChange={handleCurrencyChange}
          disabled={isUpdating}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_CURRENCIES.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                {currency.symbol} {currency.code} - {currency.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          All transaction totals will be displayed in this currency
        </p>
      </div>

      <ConfirmModal
        isOpen={showRecalculateModal}
        onClose={handleCancelChange}
        onConfirm={handleConfirmChange}
        title="Change base currency"
        description={
          <div className="space-y-4">
            <p>
              Changing the base currency to{" "}
              <strong>
                {SUPPORTED_CURRENCIES.find((c) => c.code === pendingCurrency)
                  ?.name ?? pendingCurrency}
              </strong>{" "}
              will recalculate all your transactions using historical exchange
              rates.
            </p>
            <Alert>
              <AlertTriangleIcon className="size-4" />
              <AlertTitle>This may take some time</AlertTitle>
              <AlertDescription>
                Depending on the number of transactions, this operation may take
                a while to complete. Please don't close the app while it's
                running.
              </AlertDescription>
            </Alert>
          </div>
        }
        confirmText={
          isUpdating ? (
            <span className="flex items-center gap-2">
              <LoaderIcon className="size-4 animate-spin" />
              Recalculating...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <RefreshCwIcon className="size-4" />
              Change and recalculate
            </span>
          )
        }
        isLoading={isUpdating}
      />
    </div>
  );
}
