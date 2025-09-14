import { useState, useEffect } from "react";
import {
  Trash2Icon,
  Loader2Icon,
  ChevronDownIcon,
  ArrowLeftIcon,
  CircleQuestionMarkIcon,
  ArrowRightLeftIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteByType, useRouter } from "@/shared/stacked-router/router";
import { PageHeader } from "../shared/page-header";
import { Page } from "../shared/page";
import { ConfirmModal } from "../shared/confirm-modal";
import { Footer } from "../shared/footer";
import { trpc } from "@/shared/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TransactionType } from "api";
import { DateTime } from "luxon";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type Form = {
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

  const [formData, setFormData] = useState<Form>({
    description: "",
    accountId: route.accountId || "",
    amount: "",
    date: new Date(),
    time: DateTime.now().toFormat("HH:mm"),
    type: "expense",
    isCountable: true,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const { data: transaction } = useQuery(
    trpc.expenses.getTransaction.queryOptions(
      { id: transactionId! },
      { enabled: Boolean(transactionId) },
    ),
  );

  const { data: accounts = [] } = useQuery(trpc.accounts.list.queryOptions());
  const selectedAccount = accounts.find((acc) => acc.id === formData.accountId);

  const queryClient = useQueryClient();

  const updateTransactionMutation = useMutation(
    trpc.expenses.updateTransaction.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.expenses.transactionsList.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.expenses.overview.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.expenses.transactionsByMonth.queryKey(),
        });
      },
    }),
  );

  const createTransactionMutation = useMutation(
    trpc.expenses.createTransaction.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.expenses.transactionsList.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.expenses.overview.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.expenses.transactionsByMonth.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.accounts.list.queryKey(),
        });
      },
    }),
  );

  const deleteTransactionMutation = useMutation(
    trpc.expenses.deleteTransaction.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.expenses.transactionsList.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.expenses.overview.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.expenses.transactionsByMonth.queryKey(),
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
        description: transaction.desc,
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
        isCountable: formData.isCountable,
      });
      pop();
    } else {
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

      await createTransactionMutation.mutateAsync({
        accountId: formData.accountId,
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        createdAt: isoString || new Date().toISOString(),
      });

      navigate({ type: "main" });
    }
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
    <Page
      title={
        <PageHeader
          title={isEdit ? "Edit transaction" : "Add transaction"}
          rightSlot={deleteButton}
        />
      }
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

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Description</label>
              {isTransactionLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <Textarea
                  placeholder="Groceries"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={2}
                />
              )}
            </div>

            {/* Countable switch - only show in edit mode */}
            {isEdit && (
              <div className="flex flex-col gap-2 pl-0.5">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    {isTransactionLoading ? (
                      <Skeleton className="h-5 w-8" />
                    ) : (
                      <Switch
                        checked={!formData.isCountable}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            isCountable: !checked,
                          }))
                        }
                      />
                    )}
                    <span className="text-sm text-muted-foreground">
                      Exclude from totals
                    </span>
                  </label>
                  <CircleQuestionMarkIcon
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsHelpOpen(true);
                    }}
                    className="size-4 text-muted-foreground active:scale-95 transition-transform cursor-pointer flex-shrink-0"
                  />
                </div>
              </div>
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
        <Footer>
          <div className="flex gap-2">
            <Button
              size={"lg"}
              variant="outline"
              type="button"
              className="flex-1"
              onClick={pop}
              disabled={isSaving || isTransactionLoading}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </Button>
            <Button
              className="flex-1"
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
          </div>
        </Footer>
      </form>

      <Drawer open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle />
            <DrawerDescription />
          </DrawerHeader>

          <div className="px-4 pb-6 space-y-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                <ArrowRightLeftIcon className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-md font-medium text-foreground mb-0.5">
                  Why exclude transactions?
                </p>
                <p className="text-sm text-muted-foreground">
                  When you transfer money between your accounts, it's not really
                  spending - it's just moving money. Mark these transactions as
                  "excluded" so they don't affect your spending totals.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={() => setIsHelpOpen(false)}
                className="w-full"
                size="lg"
              >
                Got it
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </Page>
  );
}
