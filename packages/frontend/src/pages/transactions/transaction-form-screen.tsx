import { useState, useEffect } from "react";
import { Trash2Icon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation, useSearch } from "wouter";
import { render, safeParseQuery } from "typesafe-routes";
import { PageHeader } from "../shared/page-header";
import { Page } from "../shared/page";
import { ConfirmModal } from "../shared/confirm-modal";
import { Footer } from "../shared/footer";
import { api } from "@/api";
import { routes } from "../../routes";
import { formatDisplayDate } from "@/shared/utils";
import { SupportedCurrency } from "api";
import { cn } from "@/lib/utils";
import { getColorById } from "../accounts/account-colors";
import { getCurrencySymbol } from "../../shared/currency-converter";

type Form = {
  description: string;
  accountId: string;
  amount: string;
};

type FormStep = "account" | "details";

export function TransactionFormScreen() {
  const [, navigate] = useLocation();
  const parsedQuery = safeParseQuery(routes.transactionForm, useSearch());
  const transactionId = parsedQuery.success
    ? parsedQuery.data.transactionId
    : null;
  const isEdit = Boolean(transactionId);

  const [formData, setFormData] = useState<Form>({
    description: "",
    accountId: "",
    amount: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>(
    isEdit ? "details" : "account",
  );

  const { data: transaction } = api.expenses.getTransaction.useQuery(
    { id: transactionId! },
    { enabled: Boolean(transactionId) },
  );

  const { data: accounts = [] } = api.accounts.listWithStats.useQuery();
  const selectedAccount = accounts.find((acc) => acc.id === formData.accountId);

  const utils = api.useUtils();

  const updateTransactionMutation = api.expenses.updateTransaction.useMutation({
    onSuccess: () => {
      utils.expenses.transactionsList.invalidate();
      utils.expenses.overview.invalidate();
      utils.expenses.transactionsByMonth.invalidate();
    },
  });

  const createTransactionMutation = api.expenses.createTransaction.useMutation({
    onSuccess: () => {
      utils.expenses.transactionsList.invalidate();
      utils.expenses.overview.invalidate();
      utils.expenses.transactionsByMonth.invalidate();
      utils.accounts.listWithStats.invalidate();
    },
  });

  const deleteTransactionMutation = api.expenses.deleteTransaction.useMutation({
    onSuccess: () => {
      utils.expenses.transactionsList.invalidate();
      utils.expenses.overview.invalidate();
      utils.expenses.transactionsByMonth.invalidate();
      navigate(
        render(routes.transactions, {
          path: {},
          query: {
            filters: {
              accounts: [],
              date: { type: "months", value: 3 },
            },
          },
        }),
      );
    },
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.desc,
        accountId: transaction.accountId,
        amount: (Math.abs(transaction.amount) / 100).toString(),
      });
    }
  }, [transaction]);

  const handleSave = async () => {
    try {
      if (isEdit && transactionId) {
        await updateTransactionMutation.mutateAsync({
          id: transactionId,
          description: formData.description,
        });
      } else {
        await createTransactionMutation.mutateAsync({
          accountId: formData.accountId,
          description: formData.description,
          amount: parseFloat(formData.amount),
          date: new Date().toISOString().split("T")[0],
        });
      }
      navigate(
        render(routes.transactions, {
          path: {},
          query: {
            filters: {
              accounts: [],
              date: { type: "months", value: 3 },
            },
          },
        }),
      );
    } catch (error) {
      console.error("Failed to save transaction:", error);
    }
  };

  const handleDelete = async () => {
    if (!transactionId) return;

    try {
      await deleteTransactionMutation.mutateAsync({ id: transactionId });
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  const isLoading =
    updateTransactionMutation.isPending ||
    deleteTransactionMutation.isPending ||
    createTransactionMutation.isPending;

  const deleteButton = isEdit && (
    <button
      onClick={() => setShowDeleteConfirm(true)}
      disabled={isLoading}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
    >
      <Trash2Icon className="w-5 h-5" />
    </button>
  );

  if (isEdit && !transaction) {
    return (
      <Page>
        <div className="flex justify-center items-center py-12">
          <Loader2Icon className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        title={isEdit ? "Edit Transaction" : "Add Transaction"}
        rightSlot={deleteButton}
      />

      <div className="flex-1 p-4 bg-background flex flex-col">
        <div className="flex-1 space-y-6">
          {/* Account Selection Step */}
          {currentStep === "account" && (
            <>
              <div className="flex flex-col gap-4">
                <label className="text-sm font-medium">Select Account</label>
                {accounts.map((account) => {
                  const colorInfo = getColorById(account.color);
                  return (
                    <button
                      key={account.id}
                      className="bg-card rounded-2xl border p-4 text-left hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          accountId: account.id,
                        }));
                        setCurrentStep("details");
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div
                            className={cn("w-12 h-12 rounded-xl", colorInfo.bg)}
                          />
                          <div
                            className={cn(
                              "absolute inset-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold",
                              colorInfo.text,
                            )}
                          >
                            {getCurrencySymbol(
                              account.currency as SupportedCurrency,
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-lg">
                            {account.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {account.currency}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Transaction Details Step */}
          {currentStep === "details" && (
            <>
              {/* Show selected account if creating */}
              {!isEdit && selectedAccount && (
                <div className="bg-card rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg",
                          getColorById(selectedAccount.color).bg,
                        )}
                      />
                      <div
                        className={cn(
                          "absolute inset-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold",
                          getColorById(selectedAccount.color).text,
                        )}
                      >
                        {getCurrencySymbol(
                          selectedAccount.currency as SupportedCurrency,
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {selectedAccount.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedAccount.currency}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Date display for edit mode */}
              {isEdit && transaction && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Date</label>
                  <div className="px-3 py-2 border border-input bg-muted rounded-md text-sm text-muted-foreground">
                    {formatDisplayDate(transaction.date)}
                  </div>
                </div>
              )}

              {/* Amount display for edit mode */}
              {isEdit && transaction && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Amount</label>
                  <div className="px-3 py-2 border border-input bg-muted rounded-md text-sm text-muted-foreground">
                    {(Math.abs(transaction.amount) / 100).toFixed(2)}{" "}
                    {transaction.currency}
                  </div>
                </div>
              )}

              {/* Amount input for create mode */}
              {!isEdit && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Amount</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      className="flex-1"
                    />
                    <div className="px-3 py-2 border border-input bg-muted rounded-md text-sm text-muted-foreground min-w-16 flex items-center justify-center">
                      {selectedAccount?.currency}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Enter transaction description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
            </>
          )}
        </div>

        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete Transaction"
          description="This will permanently delete this transaction. This action cannot be undone."
          confirmText="Delete"
          isLoading={deleteTransactionMutation.isPending}
        />
      </div>

      {currentStep === "details" && (
        <Footer>
          <div className="flex gap-2">
            <Button
              size={"lg"}
              variant="outline"
              className="flex-1"
              onClick={() => setCurrentStep("account")}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button
              className="flex-1"
              size="lg"
              onClick={handleSave}
              disabled={
                !formData.description.trim() ||
                (!isEdit && (!formData.amount.trim() || !formData.accountId)) ||
                isLoading
              }
            >
              {isLoading ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </Footer>
      )}
    </Page>
  );
}
