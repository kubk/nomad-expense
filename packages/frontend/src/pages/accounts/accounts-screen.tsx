import {
  PlusIcon,
  Loader2,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeOffIcon,
  EyeIcon,
} from "lucide-react";
import type { Account } from "api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrencySymbol } from "../../shared/currency-formatter";
import { PageHeader } from "../widgets/page-header";
import { trpc, queryClient } from "@/shared/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Page } from "../widgets/page";
import { getColorById } from "./account-colors";
import { cn } from "@/lib/utils";
import { DateTime } from "luxon";
import { RouteByType, useRouter } from "@/shared/stacked-router/router";
import { isFormRoute } from "@/shared/stacked-router/routes";
import { NoAccountsEmptyState } from "../widgets/no-accounts-empty-state";
import { Footer } from "../widgets/footer";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { haptic } from "@/shared/platform/haptics";
import { useTranslation } from "@/translations/translation-provider";
import { AccountsActionsMenu } from "./accounts-actions-menu";
import { SwipeableAccountCard } from "./swipeable-account-card";
import { toast } from "sonner";

const MotionFooter = motion.create(Footer);

export function AccountsScreen({ route }: { route: RouteByType<"accounts"> }) {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const [reorderedAccounts, setReorderedAccounts] = useState<Account[] | null>(
    null,
  );
  const [showHiddenAccounts, setShowHiddenAccounts] = useState(false);

  const accountsQueryOptions = trpc.accounts.list.queryOptions();
  const { data: accounts = [], isLoading } = useQuery(accountsQueryOptions);

  const setHiddenMutation = useMutation(
    trpc.accounts.setHidden.mutationOptions({
      onMutate: async ({ id, isHidden }) => {
        await queryClient.cancelQueries({
          queryKey: accountsQueryOptions.queryKey,
        });

        queryClient.setQueryData(
          accountsQueryOptions.queryKey,
          (currentAccounts) =>
            currentAccounts?.map((account) =>
              account.id === id ? { ...account, isHidden } : account,
            ),
        );
      },
      onError: () => {
        haptic("error");
        toast.error(t("somethingWentWrong"));
      },
      onSettled: () =>
        queryClient.invalidateQueries({
          queryKey: accountsQueryOptions.queryKey,
        }),
    }),
  );

  const reorderMutation = useMutation(
    trpc.accounts.reorder.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.accounts.list.queryKey(),
        });
        setReorderedAccounts(null);
      },
    }),
  );

  const isReorderMode = reorderedAccounts !== null;
  const hiddenAccounts = accounts.filter((account) => account.isHidden);
  const visibleAccounts =
    reorderedAccounts ?? accounts.filter((account) => !account.isHidden);
  const hasHiddenAccounts = hiddenAccounts.length > 0;

  const handleAccountClick = (accountId: string) => {
    if (isReorderMode) return; // Don't navigate in reorder mode
    haptic("selection");
    navigate({ type: "accountForm", accountId });
  };

  const handleAddAccountClick = () => {
    haptic("light");
    navigate({ type: "accountForm" });
  };

  const handleReorderClick = () => {
    setReorderedAccounts([...visibleAccounts]);
  };

  const handleCancelReorder = () => {
    setReorderedAccounts(null);
  };

  const handleSaveReorder = () => {
    if (!reorderedAccounts) return;
    let visibleAccountIndex = 0;
    const accountIds = accounts.map((account) => {
      if (account.isHidden) return account.id;

      const reorderedAccount = reorderedAccounts[visibleAccountIndex];
      visibleAccountIndex += 1;
      return reorderedAccount?.id ?? account.id;
    });
    reorderMutation.mutate({ accountIds });
  };

  const handleHideAccount = (accountId: string) => {
    haptic("heavy");
    setHiddenMutation.mutate({ id: accountId, isHidden: true });
  };

  const handleUnhideAccount = (accountId: string) => {
    haptic("selection");
    if (hiddenAccounts.length === 1) setShowHiddenAccounts(false);
    setHiddenMutation.mutate({ id: accountId, isHidden: false });
  };

  const handleToggleHiddenAccounts = () => {
    haptic("selection");
    setShowHiddenAccounts((currentValue) => !currentValue);
  };

  const moveAccount = (index: number, direction: "up" | "down") => {
    if (!reorderedAccounts) return;
    haptic("selection");
    const newAccounts = [...reorderedAccounts];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newAccounts.length) return;

    [newAccounts[index], newAccounts[targetIndex]] = [
      newAccounts[targetIndex],
      newAccounts[index],
    ];
    setReorderedAccounts(newAccounts);
  };

  const showDropdown = accounts.length >= 2;

  const renderAccountContent = (
    account: (typeof accounts)[number],
    reorderIndex?: number,
  ) => {
    const colorInfo = getColorById(account.color);
    const canReorder = reorderIndex !== undefined;

    return (
      <div className="flex items-center">
        <button
          className="flex-1 p-5 text-left transition-transform"
          onClick={() => handleAccountClick(account.id)}
          disabled={isReorderMode}
        >
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className={cn("h-12 w-12 rounded-xl", colorInfo.bg)} />
              <div
                className={cn(
                  "absolute inset-0 flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold",
                  colorInfo.text,
                )}
              >
                {getCurrencySymbol(account.currency)}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {account.name}
              </h3>
              <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                <span>
                  {t(
                    "accountsTransactionCount",
                    account.transactionCount,
                  )}
                </span>
                {account.lastTransactionDate && (
                  <>
                    <span>·</span>
                    <span>
                      {t(
                        "accountsLastTransaction",
                        DateTime.fromISO(
                          account.lastTransactionDate,
                        ).toLocaleString(DateTime.DATE_SHORT),
                      )}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </button>

        {account.isHidden && !isReorderMode && (
          <Button
            variant="ghost"
            size="sm"
            title={t("accountsShowAccount")}
            onClick={() => handleUnhideAccount(account.id)}
            className="mr-3 h-9 w-9 p-0 text-muted-foreground"
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
        )}

        <AnimatePresence>
          {canReorder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: reorderIndex * 0.05 }}
              className="flex flex-col gap-1 px-3 py-2"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveAccount(reorderIndex, "up")}
                disabled={reorderIndex === 0}
                className="h-8 w-8 p-0"
              >
                <ChevronUpIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveAccount(reorderIndex, "down")}
                disabled={reorderIndex === visibleAccounts.length - 1}
                className="h-8 w-8 p-0"
              >
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      <Page
        isForm={isFormRoute(route)}
        title={
          <PageHeader
            title={t("accountsTitle")}
            rightSlot={
              !isReorderMode && showDropdown ? (
                <AccountsActionsMenu
                  onCreateAccount={handleAddAccountClick}
                  onReorderAccounts={handleReorderClick}
                />
              ) : !isReorderMode ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddAccountClick}
                >
                  <PlusIcon className="w-4 h-4" />
                </Button>
              ) : null
            }
          />
        }
      >
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <motion.div layout className="flex flex-col gap-3">
            {accounts.length === 0 && !isReorderMode && (
              <div className="mt-[35%]">
                <NoAccountsEmptyState />
              </div>
            )}

            <AnimatePresence initial={false}>
              {visibleAccounts.map((account, index) => {
                if (isReorderMode) {
                  return (
                    <motion.div
                      key={account.id}
                      layout
                      className="w-full rounded-2xl border-none bg-card shadow-sm transition-colors"
                    >
                      {renderAccountContent(account, index)}
                    </motion.div>
                  );
                }

                return (
                  <SwipeableAccountCard
                    key={account.id}
                    onHide={() => handleHideAccount(account.id)}
                  >
                    {renderAccountContent(account)}
                  </SwipeableAccountCard>
                );
              })}

              {hasHiddenAccounts && (
                <motion.div
                  key="hidden-accounts-toggle"
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center py-1"
                >
                  <Badge
                    asChild
                    variant="outline"
                    className="h-7 rounded-full border-border/50 bg-transparent px-3 py-0 text-muted-foreground shadow-none transition-transform hover:bg-muted hover:text-foreground active:scale-95 [&>svg]:size-3.5"
                  >
                    <button type="button" onClick={handleToggleHiddenAccounts}>
                      <EyeOffIcon />
                      {showHiddenAccounts
                        ? t("accountsHideHidden")
                        : t("accountsHiddenAccounts")}
                    </button>
                  </Badge>
                </motion.div>
              )}

              {showHiddenAccounts &&
                hiddenAccounts.map((account) => (
                  <motion.div
                    key={`hidden-${account.id}`}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="w-full rounded-2xl border-none bg-card shadow-sm"
                  >
                    {renderAccountContent(account)}
                  </motion.div>
                ))}
            </AnimatePresence>
          </motion.div>
        )}
      </Page>

      {/* Bottom action buttons for reorder mode */}
      <AnimatePresence>
        {isReorderMode && (
          <MotionFooter
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              ease: "easeInOut",
            }}
            className="z-50 w-full"
          >
            <Button
              variant="outline"
              className="flex-1"
              size="lg"
              onClick={handleCancelReorder}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="default"
              className="flex-1"
              size="lg"
              onClick={handleSaveReorder}
              disabled={reorderMutation.isPending}
            >
              {reorderMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t("save")
              )}
            </Button>
          </MotionFooter>
        )}
      </AnimatePresence>
    </>
  );
}
