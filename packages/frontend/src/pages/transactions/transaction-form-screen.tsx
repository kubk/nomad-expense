import { useState, useEffect } from "react";
import { Trash2Icon, Loader2Icon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation, useSearch } from "wouter";
import { render, safeParseQuery } from "typesafe-routes";
import { PageHeader } from "../shared/page-header";
import { Page } from "../shared/page";
import { ConfirmModal } from "../shared/confirm-modal";
import { Footer } from "../shared/footer";
import { api } from "@/api";
import { routes } from "../../routes";
import { TransactionType } from "api";
import { AccountPicker } from "./account-picker";
import { DateTime } from "luxon";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Form = {
  description: string;
  accountId: string;
  amount: string;
  date: Date | undefined;
  time: string;
  type: TransactionType;
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
    date: undefined,
    time: "",
    type: "expense",
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
      // Parse ISO timestamp string using luxon
      const transactionDateTime = DateTime.fromISO(transaction.createdAt);
      const transactionDate = transactionDateTime.toJSDate();
      const timeString = transactionDateTime.toFormat("HH:mm");

      setFormData({
        description: transaction.desc,
        accountId: transaction.accountId,
        amount: (transaction.amount / 100).toString(),
        date: transactionDate,
        time: timeString,
        type: transaction.type,
      });
    }
  }, [transaction]);

  const handleSave = async () => {
    if (isEdit && transactionId) {
      let isoString: string | undefined = undefined;
      if (formData.date && formData.time) {
        const dateTime = DateTime.fromJSDate(formData.date).set({
          hour: parseInt(formData.time.split(":")[0]),
          minute: parseInt(formData.time.split(":")[1]),
          second: 0,
          millisecond: 0,
        });
        isoString = dateTime.toISO() || undefined;
      }

      await updateTransactionMutation.mutateAsync({
        id: transactionId,
        description: formData.description,
        amount: parseFloat(formData.amount),
        createdAt: isoString || new Date().toISOString(),
        type: formData.type,
      });
    } else {
      await createTransactionMutation.mutateAsync({
        accountId: formData.accountId,
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
      });
    }
    window.history.back();
  };

  const handleDelete = async () => {
    if (!transactionId) return;

    await deleteTransactionMutation.mutateAsync({ id: transactionId });
  };

  const isSaving =
    updateTransactionMutation.isPending ||
    deleteTransactionMutation.isPending ||
    createTransactionMutation.isPending;

  const deleteButton = isEdit && (
    <button
      onClick={() => setShowDeleteConfirm(true)}
      disabled={isSaving}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
    >
      <Trash2Icon className="w-5 h-5" />
    </button>
  );

  const isTransactionLoading = isEdit && !transaction;

  return (
    <Page>
      <PageHeader
        title={isEdit ? "Edit Transaction" : "Add Transaction"}
        rightSlot={deleteButton}
      />

      {currentStep === "account" && (
        <AccountPicker
          onSelect={(accountId) => {
            setFormData((prev) => ({
              ...prev,
              accountId,
            }));
            setCurrentStep("details");
          }}
        />
      )}

      {currentStep === "details" && (
        <>
          <div className="flex-1 p-4 bg-background flex flex-col">
            <div className="flex-1 space-y-6">
              {/* Transaction Details Step */}
              {/* Date/Time picker for edit mode */}
              {isEdit && (
                <div className="flex gap-4">
                  <div className="flex flex-col gap-3 flex-1">
                    <Label htmlFor="date-picker" className="px-1">
                      Date
                    </Label>
                    {isTransactionLoading ? (
                      <Skeleton className="h-9 w-full" />
                    ) : (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            id="date-picker"
                            className="justify-between font-normal"
                          >
                            {formData.date
                              ? formData.date.toLocaleDateString()
                              : "Select date"}
                            <ChevronDownIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto overflow-hidden p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={formData.date}
                            onSelect={(date) => {
                              setFormData((prev) => ({
                                ...prev,
                                date,
                              }));
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 flex-1">
                    <Label htmlFor="time-picker" className="px-1">
                      Time
                    </Label>
                    {isTransactionLoading ? (
                      <Skeleton className="h-9 w-full" />
                    ) : (
                      <Input
                        type="time"
                        id="time-picker"
                        value={formData.time}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            time: e.target.value,
                          }))
                        }
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Transaction Type Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Type</label>
                {isTransactionLoading ? (
                  <Skeleton className="h-9 rounded-md w-full" />
                ) : (
                  <Tabs
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: value as TransactionType,
                      }))
                    }
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="expense">Expense</TabsTrigger>
                      <TabsTrigger value="income">Income</TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}
              </div>

              {/* Amount input for both edit and create modes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Amount</label>
                <div className="flex gap-2">
                  {isTransactionLoading ? (
                    <>
                      <Skeleton className="h-9.5 flex-1" />
                      <Skeleton className="h-9.5 w-16" />
                    </>
                  ) : (
                    <>
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
                        {isEdit && transaction
                          ? transaction.currency
                          : selectedAccount?.currency}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Description</label>
                {isTransactionLoading ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <Input
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                )}
              </div>
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
          <Footer>
            <div className="flex gap-2">
              <Button
                size={"lg"}
                variant="outline"
                className="flex-1"
                onClick={() => setCurrentStep("account")}
                disabled={isSaving || isTransactionLoading}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                size="lg"
                onClick={handleSave}
                disabled={
                  !formData.description.trim() ||
                  !formData.amount.trim() ||
                  (!isEdit && !formData.accountId) ||
                  isSaving ||
                  isTransactionLoading
                }
              >
                {isSaving ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </Footer>
        </>
      )}
    </Page>
  );
}
