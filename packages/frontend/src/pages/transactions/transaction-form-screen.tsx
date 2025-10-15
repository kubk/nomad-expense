import { useState, useEffect } from "react";
import {
  Trash2Icon,
  Loader2Icon,
  ChevronDownIcon,
  ArrowLeftIcon,
  RepeatIcon,
} from "lucide-react";
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
import { RouteByType, useRouter } from "@/shared/stacked-router/router";
import { isFormRoute } from "@/shared/stacked-router/routes";
import { PageHeader } from "../widgets/page-header";
import { Page } from "../widgets/page";
import { ConfirmModal } from "../widgets/confirm-modal";
import { Footer } from "../widgets/footer";
import { trpc, queryClient } from "@/shared/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TransactionType } from "api";
import { DateTime } from "luxon";
import { getCurrencySymbol } from "@/shared/currency-formatter";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormActionButton } from "@/components/ui/form-action-button";
import { UploadStatementButton } from "./upload-statement-button";
import { useInvalidateTransactions } from "@/shared/hooks/use-invalidate-transactions";
import { CountableSwitch } from "./countable-switch";
import { QuickTitles } from "./quick-titles";

export type TransactionForm = {
  description: string;
  accountId: string;
  amount: string;
  date: Date | undefined;
  time: string;
  type: TransactionType;
  isCountable: boolean;
};

export function TransactionFormScreen({
  route,
}: {
  route: RouteByType<"transactionForm">;
}) {
  const { pop, navigate } = useRouter();
  const transactionId = route.transactionId;
  const isEdit = Boolean(transactionId);

  const [formData, setFormData] = useState<TransactionForm>({
    description: "",
    accountId: route.accountId || "",
    amount: "",
    date: new Date(),
    time: DateTime.now().toFormat("HH:mm"),
    type: "expense",
    isCountable: true,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: transaction } = useQuery(
    trpc.expenses.getTransaction.queryOptions(
      { id: transactionId! },
      { enabled: Boolean(transactionId) },
    ),
  );

  const { data: accounts = [] } = useQuery(trpc.accounts.list.queryOptions());
  const selectedAccount = accounts.find((acc) => acc.id === formData.accountId);

  const invalidateTransactions = useInvalidateTransactions();

  const updateTransactionMutation = useMutation(
    trpc.expenses.updateTransaction.mutationOptions({
      onSuccess: () => {
        invalidateTransactions();
      },
    }),
  );

  const createTransactionMutation = useMutation(
    trpc.expenses.createTransaction.mutationOptions({
      onSuccess: () => {
        invalidateTransactions();
        queryClient.invalidateQueries({
          queryKey: trpc.accounts.list.queryKey(),
        });
      },
    }),
  );

  const deleteTransactionMutation = useMutation(
    trpc.expenses.deleteTransaction.mutationOptions({
      onSuccess: () => {
        invalidateTransactions();
        pop();
      },
    }),
  );

  const repeatTransactionMutation = useMutation(
    trpc.expenses.createTransaction.mutationOptions({
      onSuccess: () => {
        invalidateTransactions();
        queryClient.invalidateQueries({
          queryKey: trpc.accounts.list.queryKey(),
        });
        pop();
      },
    }),
  );

  useEffect(() => {
    if (transaction) {
      // Parse ISO timestamp string using luxon
      const transactionDateTime = DateTime.fromISO(transaction.createdAt);
      const transactionDate = transactionDateTime.toJSDate();
      const timeString = transactionDateTime.toFormat("HH:mm");

      setFormData({
        description: transaction.description,
        accountId: transaction.accountId,
        amount: (transaction.amount / 100).toString(),
        date: transactionDate,
        time: timeString,
        type: transaction.type,
        isCountable: transaction.isCountable,
      });
    }
  }, [transaction]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const getCreatedAt = () => {
      if (!formData.date || !formData.time) {
        return new Date().toISOString();
      }

      const [hour, minute] = formData.time.split(":");
      const dateTime = DateTime.fromJSDate(formData.date).set({
        hour: parseInt(hour),
        minute: parseInt(minute),
        second: 0,
      });
      return dateTime.toISO() || new Date().toISOString();
    };

    if (isEdit && transactionId) {
      await updateTransactionMutation.mutateAsync({
        id: transactionId,
        description: formData.description,
        amount: parseFloat(formData.amount),
        createdAt: getCreatedAt(),
        type: formData.type,
        isCountable: formData.isCountable,
      });
      pop();
    } else {
      await createTransactionMutation.mutateAsync({
        accountId: formData.accountId,
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        createdAt: getCreatedAt(),
      });

      navigate({ type: "main" });
    }
  };

  const handleDelete = async () => {
    if (!transactionId) return;

    await deleteTransactionMutation.mutateAsync({ id: transactionId });
  };

  const handleRepeat = async () => {
    if (!transaction) return;

    await repeatTransactionMutation.mutateAsync({
      accountId: transaction.accountId,
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type,
      createdAt: new Date().toISOString(),
    });
  };

  const isSaving =
    updateTransactionMutation.isPending ||
    createTransactionMutation.isPending ||
    repeatTransactionMutation.isPending;

  const isTransactionLoading = isEdit && !transaction;

  return (
    <Page
      title={
        <PageHeader title={isEdit ? "Edit transaction" : "Add transaction"} />
      }
      isForm={isFormRoute(route)}
    >
      <form onSubmit={handleSave}>
        <div className="flex-1 flex flex-col">
          <div className="flex-1 space-y-6">
            {/* Transaction Type Selector */}
            <div className="flex flex-col gap-2">
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

            {/* Transaction Details Step */}
            {/* Date/Time picker for both create and edit mode */}
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
                        type="button"
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

            {/* Amount input for both edit and create modes */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Amount</label>
              <div className="flex gap-3">
                {isTransactionLoading ? (
                  <>
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
                    <div className="text-lg text-muted-foreground min-w-16 flex items-center justify-center">
                      {(() => {
                        const currencyCode =
                          isEdit && transaction
                            ? transaction.currency
                            : selectedAccount?.currency;
                        if (!currencyCode) return "";
                        const symbol = getCurrencySymbol(currencyCode);
                        return `${symbol} · ${currencyCode}`;
                      })()}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {!isEdit && !isTransactionLoading && formData.accountId && (
                <QuickTitles
                  accountId={formData.accountId}
                  transactionType={formData.type}
                  onTitleClick={(title) =>
                    setFormData((prev) => ({ ...prev, description: title }))
                  }
                />
              )}
              {isTransactionLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Input
                  placeholder="Groceries"
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

            <div className="flex flex-col gap-1 mt-4">
              {isTransactionLoading && <Skeleton className="h-11" />}
              {!isTransactionLoading && (
                <div className="flex gap-3">
                  {isEdit && (
                    <>
                      <FormActionButton
                        onClick={handleRepeat}
                        icon={
                          repeatTransactionMutation.isPending ? (
                            <Loader2Icon className="h-4 w-4 animate-spin" />
                          ) : (
                            <RepeatIcon className="h-4 w-4" />
                          )
                        }
                        disabled={
                          repeatTransactionMutation.isPending ||
                          isSaving ||
                          isTransactionLoading
                        }
                      >
                        Repeat
                      </FormActionButton>
                      <FormActionButton
                        onClick={() => setShowDeleteConfirm(true)}
                        icon={<Trash2Icon className="h-4 w-4" />}
                      >
                        Delete
                      </FormActionButton>
                    </>
                  )}
                  {formData.accountId && !isEdit ? (
                    <UploadStatementButton accountId={formData.accountId} />
                  ) : null}
                </div>
              )}
            </div>

            {isEdit && selectedAccount?.bankType ? (
              <CountableSwitch
                formData={formData}
                setFormData={setFormData}
                isTransactionLoading={isTransactionLoading}
              />
            ) : null}
          </div>

          <ConfirmModal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDelete}
            title="Delete transaction"
            description="This will permanently delete this transaction. This action cannot be undone."
            confirmText="Delete"
            isLoading={deleteTransactionMutation.isPending}
          />
        </div>
        <Footer>
          <Button
            size={"lg"}
            variant="outline"
            type="button"
            onClick={pop}
            disabled={isSaving || isTransactionLoading}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Button>
          <Button
            size="lg"
            type="submit"
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
        </Footer>
      </form>
    </Page>
  );
}
