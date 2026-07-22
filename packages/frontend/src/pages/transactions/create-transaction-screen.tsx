import { useEffect, useState } from "react";
import { DeleteIcon, Loader2Icon } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Account, TransactionType } from "api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrencySymbol } from "@/shared/currency-formatter";
import { queryClient, trpc } from "@/shared/api";
import { useInvalidateTransactions } from "@/shared/hooks/use-invalidate-transactions";
import { haptic } from "@/shared/platform/haptics";
import { isTelegram } from "@/shared/platform/telegram-platform";
import type { RouteByType } from "@/shared/stacked-router/router";
import { useRouter } from "@/shared/stacked-router/router";
import { isFormRoute } from "@/shared/stacked-router/routes";
import { useTranslation } from "@/translations/translation-provider";
import { NoAccountsEmptyState } from "../widgets/no-accounts-empty-state";
import { Page } from "../widgets/page";
import { PageHeader } from "../widgets/page-header";
import { Footer } from "../widgets/footer";
import { QuickTitles } from "./quick-titles";
import { UploadStatementButton } from "./upload-statement-button";
import { AccountPickerDrawer } from "./account-picker-drawer";

type CreateTransactionForm = {
  accountId: string;
  amount: string;
  description: string;
  type: TransactionType;
};

const keypadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"];

function getDefaultManualAccount(accounts: Account[]) {
  return accounts.reduce<Account | undefined>((defaultAccount, account) => {
    if (!defaultAccount) return account;

    return account.recentManualCount > defaultAccount.recentManualCount
      ? account
      : defaultAccount;
  }, undefined);
}

function appendAmountCharacter(amount: string, character: string) {
  if (character === ".") {
    if (amount.includes(".")) return amount;
    return amount.length === 0 ? "0." : `${amount}.`;
  }

  const decimalPart = amount.split(".")[1];
  if (decimalPart?.length === 2 || amount.replace(".", "").length >= 10) {
    return amount;
  }

  if (amount === "0") return character;
  return `${amount}${character}`;
}

function getAmountTextSize(amount: string) {
  const characterCount = Math.max(amount.length, 1);

  if (characterCount <= 4) return "text-7xl";
  if (characterCount <= 7) return "text-6xl";
  if (characterCount <= 10) return "text-5xl";
  return "text-4xl";
}

export function CreateTransactionScreen({
  route,
}: {
  route: RouteByType<"transactionForm">;
}) {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const invalidateTransactions = useInvalidateTransactions();
  const [formData, setFormData] = useState<CreateTransactionForm>({
    accountId: route.accountId ?? "",
    amount: "",
    description: "",
    type: "expense",
  });
  const { data: accounts = [], isLoading: areAccountsLoading } = useQuery(
    trpc.accounts.list.queryOptions(),
  );

  useEffect(() => {
    const hasSelectedAccount = accounts.some(
      (account) => account.id === formData.accountId,
    );
    if (hasSelectedAccount || accounts.length === 0) return;

    const defaultManualAccount = getDefaultManualAccount(accounts);
    if (!defaultManualAccount) return;

    setFormData((current) => ({
      ...current,
      accountId: defaultManualAccount.id,
    }));
  }, [accounts, formData.accountId]);

  const selectedAccount = accounts.find(
    (account) => account.id === formData.accountId,
  );
  const canUploadStatement = Boolean(selectedAccount?.bankType);

  const handleAccountChange = (accountId: string) => {
    setFormData((current) => ({ ...current, accountId }));
  };

  const { data: titles, isLoading: areTitlesLoading } = useQuery(
    trpc.expenses.getMostUsedDescriptions.queryOptions(
      {
        accountId: selectedAccount?.id ?? "",
        transactionType: formData.type,
      },
      { enabled: Boolean(selectedAccount) },
    ),
  );
  const areAccountsLoaded = !areAccountsLoading && Boolean(selectedAccount);
  const areQuickTitlesLoaded =
    Boolean(selectedAccount) &&
    !areTitlesLoading &&
    titles !== undefined;
  const isFullyLoaded = areAccountsLoaded && areQuickTitlesLoaded;

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

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    haptic("light");

    await createTransactionMutation.mutateAsync({
      accountId: formData.accountId,
      amount: Number(formData.amount),
      description: formData.description.trim(),
      type: formData.type,
    });

    navigate({ type: "main" });
  };

  const handleKeypadClick = (key: string) => {
    haptic("selection");
    setFormData((current) => ({
      ...current,
      amount: appendAmountCharacter(current.amount, key),
    }));
  };

  const handleBackspace = () => {
    haptic("selection");
    setFormData((current) => ({
      ...current,
      amount: current.amount.slice(0, -1),
    }));
  };

  const isValid =
    Boolean(selectedAccount) &&
    Number(formData.amount) > 0 &&
    Boolean(formData.description.trim());

  if (!areAccountsLoading && accounts.length === 0) {
    return (
      <Page
        title={!isTelegram() ? <PageHeader /> : undefined}
        isForm={isFormRoute(route)}
      >
        <div className="mt-[25%]">
          <NoAccountsEmptyState />
        </div>
      </Page>
    );
  }

  return (
    <Page
      title={!isTelegram() ? <PageHeader /> : undefined}
      isForm={isFormRoute(route)}
    >
      <form className="flex h-full min-h-0 flex-col" onSubmit={handleSave}>
        <div className="flex shrink-0 items-center gap-2">
          <Tabs
            className="min-w-0 flex-1"
            value={formData.type}
            onValueChange={(value) => {
              haptic("selection");
              setFormData((current) => ({
                ...current,
                type: value as TransactionType,
              }));
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense">
                {t("transactionTypeExpense")}
              </TabsTrigger>
              <TabsTrigger value="income">
                {t("transactionTypeIncome")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {selectedAccount && canUploadStatement ? (
            <UploadStatementButton accountId={selectedAccount.id} />
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="flex min-h-38 flex-1 flex-col items-center justify-center px-2 py-3">
            <div
              className="flex min-h-16 max-w-full flex-nowrap items-baseline justify-center gap-2"
              role="status"
            >
              <span
                className={`${getAmountTextSize(formData.amount)} whitespace-nowrap font-semibold tabular-nums tracking-tight`}
              >
                {formData.amount || "0"}
              </span>
              <span className="min-w-6 shrink-0 whitespace-nowrap text-2xl font-medium text-muted-foreground">
                {areAccountsLoaded && selectedAccount ? (
                  getCurrencySymbol(selectedAccount.currency)
                ) : (
                  <span className="invisible">$</span>
                )}
              </span>
            </div>

            {!areAccountsLoaded || !selectedAccount ? (
              <Skeleton className="mt-3 h-11 w-48 shrink-0 rounded-full" />
            ) : (
              <div className="mt-3 flex max-w-full shrink-0 items-center gap-2">
                <AccountPickerDrawer
                  accounts={accounts}
                  selectedAccount={selectedAccount}
                  onSelect={handleAccountChange}
                />
              </div>
            )}
          </div>

          <div className="shrink-0 space-y-3">
            <Input
              className="h-12 rounded-xl px-4 shadow-none"
              placeholder={t("transactionsDescriptionPlaceholder")}
              value={formData.description}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />

            <QuickTitles
              titles={titles}
              isLoading={!areQuickTitlesLoaded}
              onTitleClick={(description) =>
                setFormData((current) => ({ ...current, description }))
              }
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-col pb-3 pt-4">
          <div className="grid grid-cols-3 gap-2">
            {keypadKeys.map((key) => (
              <Button
                key={key}
                className="h-13 rounded-2xl bg-muted/70 text-xl shadow-none hover:bg-muted"
                onClick={() => handleKeypadClick(key)}
                type="button"
                variant="ghost"
              >
                {key}
              </Button>
            ))}
            <Button
              className="h-13 rounded-2xl bg-muted/70 shadow-none hover:bg-muted"
              disabled={!formData.amount}
              onClick={handleBackspace}
              type="button"
              variant="ghost"
            >
              <DeleteIcon className="size-5" />
            </Button>
          </div>
        </div>

        <Footer className="grid-cols-1">
          <Button
            disabled={
              !isFullyLoaded ||
              !isValid ||
              createTransactionMutation.isPending
            }
            size="lg"
            type="submit"
          >
            {createTransactionMutation.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              t("transactionsAddAction")
            )}
          </Button>
        </Footer>
      </form>
    </Page>
  );
}
