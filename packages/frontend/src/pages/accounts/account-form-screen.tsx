import { useState, useEffect } from "react";
import {
  CheckIcon,
  Trash2Icon,
  Loader2Icon,
  ListPlusIcon,
  ArrowLeftIcon,
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
import { Page } from "../shared/page";
import { ConfirmModal } from "../shared/confirm-modal";
import { Footer } from "../shared/footer";
import { trpc } from "@/shared/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  SUPPORTED_CURRENCIES,
  type SupportedCurrency,
  type AccountColor,
} from "api";
import { accountColorsPalette } from "./account-colors";
import { RouteByType, useRouter } from "@/shared/stacked-router/router";
import { Label } from "@/components/ui/label";

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
  const accountId = route.accountId;
  const isEdit = Boolean(accountId);

  const [formData, setFormData] = useState<Form>({
    name: "",
    color: accountColorsPalette[0].id,
    currency: "USD",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: accounts = [] } = useQuery(
    trpc.accounts.listWithStats.queryOptions(),
  );
  const existingAccount = accounts.find((account) => account.id === accountId);

  const queryClient = useQueryClient();

  const createAccountMutation = useMutation(
    trpc.accounts.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.accounts.listWithStats.queryKey(),
        });
      },
    }),
  );

  const updateAccountMutation = useMutation(
    trpc.accounts.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.accounts.listWithStats.queryKey(),
        });
      },
    }),
  );

  const deleteAccountMutation = useMutation(
    trpc.accounts.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.accounts.listWithStats.queryKey(),
        });
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
      },
    });
  };

  const isLoading =
    createAccountMutation.isPending ||
    updateAccountMutation.isPending ||
    deleteAccountMutation.isPending;

  return (
    <Page title={isEdit ? "Edit account" : "Add account"}>
      <form onSubmit={handleSave}>
        <div className="flex-1 space-y-6">
          <div className="flex flex-col gap-2">
            <Label>Account Name</Label>
            <Input
              placeholder="Enter account name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Color</Label>
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
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      color: color.id,
                    }))
                  }
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
              <Label>Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    currency: value as SupportedCurrency,
                  }))
                }
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
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  type="button"
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-2 px-4 py-3 bg-muted active:scale-95 rounded-xl transition-transform text-sm font-medium text-foreground disabled:opacity-50"
                >
                  <Trash2Icon className="w-4 h-4" />
                  Delete
                </button>
                <button
                  onClick={handleTransactionsClick}
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-muted active:scale-95 rounded-xl transition-transform text-sm font-medium text-foreground"
                >
                  <ListPlusIcon className="w-4 h-4" />
                  Transactions
                </button>
              </div>
            </div>
          )}
        </div>

        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete account"
          description="This will permanently delete the account and all its transactions. This action cannot be undone."
          confirmText="Delete"
          isLoading={deleteAccountMutation.isPending}
        />

        <Footer>
          <div className="flex gap-2">
            <Button
              size="lg"
              variant="outline"
              type="button"
              className="flex-1"
              onClick={pop}
              disabled={isLoading}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </Button>
            <Button
              className="flex-1"
              size="lg"
              type="submit"
              disabled={!formData.name.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </Footer>
      </form>
    </Page>
  );
}
