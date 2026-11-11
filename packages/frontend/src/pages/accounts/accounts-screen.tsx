import {
  PlusIcon,
  Loader2,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeOffIcon,
  EyeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Badge } from "@/components/ui/badge";
import { getCurrencySymbol } from "../../shared/currency-formatter";
import { PageHeader } from "../widgets/page-header";
import { accountsStore } from "@/store/accounts-store";
import { AccountsScreenStore } from "./accounts-screen-store";
import { Page } from "../widgets/page";
import { getColorById } from "./account-colors";
import { cn } from "@/lib/utils";
import { DateTime } from "luxon";
import { NoAccountsEmptyState } from "../widgets/no-accounts-empty-state";
import { Footer } from "../widgets/footer";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { t } from "@/translations/translation-store";
import { AccountsActionsMenu } from "./accounts-actions-menu";
import { SwipeableAccountCard } from "./swipeable-account-card";

const MotionFooter = motion.create(Footer);

export function AccountsScreen() {
  const [store] = useState(() => new AccountsScreenStore());
  const accounts = accountsStore.accounts;
  const isReorderMode = store.isReorderMode;
  const visibleAccounts = store.visibleAccounts;

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
          onClick={() => store.openAccount(account.id)}
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
                  {t("accountsTransactionCount", account.transactionCount)}
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
            onClick={() => store.unhideAccount(account.id)}
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
                onClick={() => store.moveAccount(reorderIndex, "up")}
                disabled={reorderIndex === 0}
                className="h-8 w-8 p-0"
              >
                <ChevronUpIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => store.moveAccount(reorderIndex, "down")}
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
        title={
          <PageHeader
            title={t("accountsTitle")}
            rightSlot={
              !isReorderMode && showDropdown ? (
                <AccountsActionsMenu
                  onCreateAccount={store.addAccount}
                  onReorderAccounts={store.startReorder}
                />
              ) : !isReorderMode ? (
                <Button variant="ghost" size="sm" onClick={store.addAccount}>
                  <PlusIcon className="w-4 h-4" />
                </Button>
              ) : null
            }
          />
        }
      >
        {accountsStore.isLoading ? (
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
                    onHide={() => store.hideAccount(account.id)}
                  >
                    {renderAccountContent(account)}
                  </SwipeableAccountCard>
                );
              })}

              {store.hiddenAccounts.length > 0 && (
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
                    <button type="button" onClick={store.toggleHiddenAccounts}>
                      <EyeOffIcon />
                      {store.showHiddenAccounts
                        ? t("accountsHideHidden")
                        : t("accountsHiddenAccounts")}
                    </button>
                  </Badge>
                </motion.div>
              )}

              {store.showHiddenAccounts &&
                store.hiddenAccounts.map((account) => (
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
              onClick={store.cancelReorder}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="default"
              className="flex-1"
              size="lg"
              onClick={store.saveReorder}
              disabled={store.reorderMutation.isPending}
            >
              <LoadingSwap isLoading={store.reorderMutation.isPending}>
                {t("save")}
              </LoadingSwap>
            </Button>
          </MotionFooter>
        )}
      </AnimatePresence>
    </>
  );
}
