import { useState, useEffect } from "react";
import {
  CheckIcon,
  Trash2Icon,
  Loader2Icon,
  ListPlusIcon,
  ArrowLeftIcon,
  PlusIcon,
  WrenchIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { queryClient, trpc } from "@/shared/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  SUPPORTED_CURRENCIES,
  type SupportedCurrency,
  type AccountColor,
} from "api";
import { accountColorsPalette } from "./account-colors";
import { RouteByType, useRouter } from "@/shared/stacked-router/router";
import { isFormRoute } from "@/shared/stacked-router/routes";
import { Label } from "@/components/ui/label";
import { FormActionButton } from "@/components/ui/form-action-button";
import { haptic } from "@/shared/platform/haptics";
import { useTranslation } from "@/translations/translation-provider";

function invalidateAccounts() {
  queryClient.invalidateQueries({
    queryKey: trpc.accounts.list.queryKey(),
  });
}

type Form = {
  name: string;
  color: AccountColor;
  currency: SupportedCurrency;
};

export function AccountFormScreen({
  route,
}: {
  route: RouteByType<"accountForm">;
}) {
  const { navigate, pop } = useRouter();
  const { t } = useTranslation();
  const accountId = route.accountId;
  const isEdit = Boolean(accountId);

  const [formData, setFormData] = useState<Form>({
    name: "",
    color: accountColorsPalette[0].id,
    currency: "USD",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: accounts = [] } = useQuery(trpc.accounts.list.queryOptions());
  const existingAccount = accounts.find((account) => account.id === accountId);

  const createAccountMutation = useMutation(
    trpc.accounts.create.mutationOptions({
      onSuccess: () => {
        invalidateAccounts();
      },
    }),
  );

  const updateAccountMutation = useMutation(
    trpc.accounts.update.mutationOptions({
      onSuccess: () => {
        invalidateAccounts();
      },
    }),
  );

  const deleteAccountMutation = useMutation(
    trpc.accounts.delete.mutationOptions({
      onSuccess: () => {
        invalidateAccounts();
        navigate({ type: "accounts" });
        setShowDeleteConfirm(false);
      },
    }),
  );

  useEffect(() => {
    if (existingAccount) {
      setFormData({
        name: existingAccount.name,
        color: existingAccount.color,
        currency: existingAccount.currency,
      });

      // Scroll to selected color when editing
      setTimeout(() => {
        const element = document.getElementById(
          `color-${existingAccount.color}`,
        );
        if (element) {
          element.scrollIntoView({ inline: "center" });
        }
      }, 300);
    }
  }, [existingAccount]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    haptic("light");
    try {
      if (isEdit && accountId) {
        await updateAccountMutation.mutateAsync({
          id: accountId,
          name: formData.name,
          color: formData.color,
        });
      } else {
        await createAccountMutation.mutateAsync({
          name: formData.name,
          color: formData.color,
          currency: formData.currency,
        });
      }
      pop();
    } catch (error) {
      console.error("Failed to save account:", error);
    }
  };

  const handleDelete = async () => {
    if (!accountId) return;

    try {
      await deleteAccountMutation.mutateAsync({ id: accountId });
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  const handleTransactionsClick = () => {
    if (!accountId) return;

    navigate({
      type: "transactions",
      filters: {
        accounts: [accountId],
        date: { type: "months", value: 3 },
        order: { field: "createdAt", direction: "desc" },
      },
    });
  };

  const handleImportClick = () => {
    if (!accountId) return;

    navigate({ type: "importSettings", accountId });
  };

  const handleCreateTransactionClick = () => {
    if (!accountId) return;

    navigate({ type: "transactionForm", accountId });
  };

  const isLoading =
    createAccountMutation.isPending || updateAccountMutation.isPending;

  return (
    <Page
      title={isEdit ? t("accountsEditTitle") : t("accountsAddTitle")}
      isForm={isFormRoute(route)}
    >
      <form onSubmit={handleSave}>
        <div className="flex-1 space-y-6">
          <div className="flex flex-col gap-2">
            <Label>{t("accountsName")}</Label>
            <Input
              placeholder={t("accountsNamePlaceholder")}
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("accountsColor")}</Label>
            <div
              className={cn(
                "flex gap-3 pb-2",
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
                  onClick={() => {
                    haptic("selection");
                    setFormData((prev) => ({
                      ...prev,
                      color: color.id,
                    }));
                  }}
                >
                  <div
                    className={cn("absolute inset-0 rounded-lg", color.bg)}
                  />
                  {formData.color === color.id && (
                    <CheckIcon
                      strokeWidth={4}
                      className={cn("w-4 h-4 relative", color.text)}
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
                value={formData.currency}
                onValueChange={(value) => {
                  haptic("selection");
                  setFormData((prev) => ({
                    ...prev,
                    currency: value as SupportedCurrency,
                  }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(() => {
                      const currency = SUPPORTED_CURRENCIES.find(
                        (c) => c.code === formData.currency,
                      );
                      return currency
                        ? `(${currency.symbol}) ${currency.code}`
                        : formData.currency;
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
                <FormActionButton
                  onClick={() => {
                    haptic("heavy");
                    setShowDeleteConfirm(true);
                  }}
                  icon={<Trash2Icon className="h-4 w-4" />}
                >
                  {t("delete")}
                </FormActionButton>
              </div>
            </div>
          )}
        </div>

        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title={t("accountsDeleteTitle")}
          description={t("accountsDeleteDescription")}
          confirmText={t("delete")}
          isLoading={deleteAccountMutation.isPending}
        />

        <Footer>
          <Button
            size="lg"
            variant="outline"
            type="button"
            onClick={pop}
            disabled={isLoading}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            {t("back")}
          </Button>
          <Button
            size="lg"
            type="submit"
            disabled={!formData.name.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              t("save")
            )}
          </Button>
        </Footer>
      </form>
    </Page>
  );
}
