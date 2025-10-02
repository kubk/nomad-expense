import {
  PlusIcon,
  Loader2,
  MoreVerticalIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowUpDownIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropDrawer,
  DropDrawerContent,
  DropDrawerItem,
  DropDrawerTrigger,
} from "@/components/ui/dropdrawer";
import { getCurrencySymbol } from "../../shared/currency-formatter";
import { PageHeader } from "../widgets/page-header";
import { trpc } from "@/shared/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { DrawerDescription } from "@/components/ui/drawer";

const MotionFooter = motion.create(Footer);

export function AccountsScreen({ route }: { route: RouteByType<"accounts"> }) {
  const { navigate } = useRouter();
  const queryClient = useQueryClient();
  const [reorderedAccounts, setReorderedAccounts] = useState<
    typeof accounts | null
  >(null);

  const { data: accounts = [], isLoading } = useQuery(
    trpc.accounts.list.queryOptions(),
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

  const handleAccountClick = (accountId: string) => {
    if (isReorderMode) return; // Don't navigate in reorder mode
    navigate({ type: "accountForm", accountId });
  };

  const handleAddAccountClick = () => {
    navigate({ type: "accountForm" });
  };

  const handleReorderClick = () => {
    setReorderedAccounts([...accounts]);
  };

  const handleCancelReorder = () => {
    setReorderedAccounts(null);
  };

  const handleSaveReorder = () => {
    if (!reorderedAccounts) return;
    const accountIds = reorderedAccounts.map((account) => account.id);
    reorderMutation.mutate({ accountIds });
  };

  const moveAccount = (index: number, direction: "up" | "down") => {
    if (!reorderedAccounts) return;
    const newAccounts = [...reorderedAccounts];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newAccounts.length) return;

    [newAccounts[index], newAccounts[targetIndex]] = [
      newAccounts[targetIndex],
      newAccounts[index],
    ];
    setReorderedAccounts(newAccounts);
  };

  const displayAccounts = reorderedAccounts ?? accounts;
  const showDropdown = accounts.length >= 2;

  return (
    <>
      <Page
        isForm={isFormRoute(route)}
        title={
          <PageHeader
            title="Accounts"
            rightSlot={
              !isReorderMode && showDropdown ? (
                <DropDrawer>
                  <DropDrawerTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVerticalIcon className="w-4 h-4" />
                    </Button>
                  </DropDrawerTrigger>
                  <DropDrawerContent align="end">
                    <DrawerDescription />
                    <DropDrawerItem
                      className="cursor-pointer"
                      icon={<PlusIcon className="h-4 w-4" />}
                      onClick={handleAddAccountClick}
                    >
                      Create account
                    </DropDrawerItem>
                    <DropDrawerItem
                      className="cursor-pointer"
                      icon={<ArrowUpDownIcon className="h-4 w-4" />}
                      onClick={handleReorderClick}
                    >
                      Reorder accounts
                    </DropDrawerItem>
                  </DropDrawerContent>
                </DropDrawer>
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
          <div className="flex flex-col gap-3">
            {displayAccounts.length === 0 && !isReorderMode && (
              <div className="mt-[35%]">
                <NoAccountsEmptyState />
              </div>
            )}

            {displayAccounts.map((account, index) => {
              const colorInfo = getColorById(account.color);
              const AccountCard = isReorderMode ? motion.div : "div";

              return (
                <AccountCard
                  key={account.id}
                  layout={isReorderMode || undefined}
                  className={cn(
                    "w-full bg-card rounded-2xl shadow-sm border-none transition-colors",
                    !isReorderMode && "active:scale-95",
                  )}
                >
                  <div className="flex items-center">
                    <button
                      className={cn(
                        "flex-1 text-left p-5 transition-transform",
                      )}
                      onClick={() => handleAccountClick(account.id)}
                      disabled={isReorderMode}
                    >
                      <div className="flex items-start gap-4">
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
                            {getCurrencySymbol(account.currency)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-lg">
                            {account.name}
                          </h3>
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                            <span>
                              {account.transactionCount} transaction
                              {account.transactionCount === 1 ? "" : "s"}
                            </span>
                            {account.lastTransactionDate && (
                              <>
                                <span>·</span>
                                <span>
                                  Last:{" "}
                                  {DateTime.fromISO(
                                    account.lastTransactionDate,
                                  ).toLocaleString(DateTime.DATE_SHORT)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isReorderMode && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{
                            delay: index * 0.05,
                          }}
                          className="flex flex-col gap-1 py-2 px-3"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveAccount(index, "up")}
                            disabled={index === 0}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronUpIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveAccount(index, "down")}
                            disabled={index === displayAccounts.length - 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronDownIcon className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </AccountCard>
              );
            })}
          </div>
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
              Cancel
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
                "Save"
              )}
            </Button>
          </MotionFooter>
        )}
      </AnimatePresence>
    </>
  );
}
