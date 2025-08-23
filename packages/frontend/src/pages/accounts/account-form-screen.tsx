import { useState, useEffect } from "react";
import { CheckIcon, Trash2Icon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation, useSearch } from "wouter";
import { safeParseQuery } from "typesafe-routes";
import { PageHeader } from "../shared/page-header";
import { Page } from "../shared/page";
import { api } from "@/api";
import { cn } from "@/lib/utils";
import { routes } from "../../routes";
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "api";

const accountColorsPalette = [
  { bg: "bg-blue-500", text: "text-blue-500" },
  { bg: "bg-green-500", text: "text-green-500" },
  { bg: "bg-purple-500", text: "text-purple-500" },
  { bg: "bg-red-500", text: "text-red-500" },
  { bg: "bg-orange-500", text: "text-orange-500" },
  { bg: "bg-yellow-500", text: "text-yellow-500" },
  { bg: "bg-pink-500", text: "text-pink-500" },
  { bg: "bg-teal-500", text: "text-teal-500" },
  { bg: "bg-cyan-500", text: "text-cyan-500" },
  { bg: "bg-lime-500", text: "text-lime-500" },
  { bg: "bg-amber-500", text: "text-amber-500" },
  { bg: "bg-emerald-500", text: "text-emerald-500" },
  { bg: "bg-rose-500", text: "text-rose-500" },
];

export function AccountFormScreen() {
  const [, navigate] = useLocation();
  const parsedQuery = safeParseQuery(routes.accountForm, useSearch());
  const accountId = parsedQuery.success ? parsedQuery.data.accountId : null;
  const isEdit = Boolean(accountId);

  const [formData, setFormData] = useState({
    name: "",
    color: accountColorsPalette[0].bg,
    currency: "USD" as SupportedCurrency,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const { data: accounts = [] } = api.accounts.listWithStats.useQuery();
  const existingAccount = accounts.find((account) => account.id === accountId);

  const utils = api.useUtils();

  const createAccountMutation = api.accounts.create.useMutation({
    onSuccess: () => {
      utils.accounts.listWithStats.invalidate();
    },
  });

  const updateAccountMutation = api.accounts.update.useMutation({
    onSuccess: () => {
      utils.accounts.listWithStats.invalidate();
    },
  });

  const deleteAccountMutation = api.accounts.delete.useMutation({
    onSuccess: () => {
      utils.accounts.listWithStats.invalidate();
      navigate("/accounts");
    },
  });

  useEffect(() => {
    if (existingAccount) {
      setFormData({
        name: existingAccount.name,
        color: existingAccount.color,
        currency: existingAccount.currency as SupportedCurrency,
      });
    }
  }, [existingAccount]);

  const handleSave = async () => {
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
      navigate("/accounts");
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

  const isLoading =
    createAccountMutation.isPending ||
    updateAccountMutation.isPending ||
    deleteAccountMutation.isPending;

  const deleteButton = isEdit && (
    <button
      onClick={() => setShowDeleteConfirm(true)}
      disabled={isLoading}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
    >
      <Trash2Icon className="w-5 h-5" />
    </button>
  );

  return (
    <Page>
      <PageHeader
        title={isEdit ? "Edit Account" : "Add Account"}
        rightSlot={deleteButton}
      />

      <div className="p-4 space-y-6 bg-background">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Account Name</label>
          <Input
            placeholder="Enter account name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Color</label>
          <div
            className={cn(
              "flex gap-3 pb-2",
              "overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
            )}
          >
            {accountColorsPalette.map((color) => (
              <button
                key={color.bg}
                className="relative w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, color: color.bg }))
                }
              >
                <div
                  className={cn(
                    "absolute inset-0 rounded-lg opacity-10",
                    color.bg,
                  )}
                />
                {formData.color === color.bg && (
                  <CheckIcon
                    strokeWidth={3}
                    className={cn("w-4 h-4 relative", color.text)}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {!isEdit && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Currency
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm"
              >
                <span>{formData.currency}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              {showCurrencyDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <button
                      key={currency.code}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          currency: currency.code,
                        }));
                        setShowCurrencyDropdown(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                        formData.currency === currency.code &&
                          "bg-accent text-accent-foreground",
                      )}
                    >
                      {currency.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <Button
            className="w-full"
            size="lg"
            onClick={handleSave}
            disabled={!formData.name.trim() || isLoading}
          >
            {isLoading ? "Saving..." : "Save Account"}
          </Button>
        </div>

        {/* Delete confirmation dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg p-6 w-full max-w-sm space-y-4">
              <h3 className="font-semibold text-lg">Delete Account</h3>
              <p className="text-sm text-muted-foreground">
                This will permanently delete the account and all its
                transactions. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  {deleteAccountMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}
