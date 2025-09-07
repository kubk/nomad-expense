import { cn } from "@/lib/utils";
import { getColorById } from "../accounts/account-colors";
import { getCurrencySymbol } from "../../shared/currency-formatter";
import { SupportedCurrency } from "api";
import { trpc } from "@/shared/api";
import { useQuery } from "@tanstack/react-query";
import { Page } from "../shared/page";
import { useRouter } from "@/shared/stacked-router/router";

export function AccountPickerScreen() {
  const { data: accounts = [] } = useQuery(
    trpc.accounts.listWithStats.queryOptions(),
  );
  const { navigate } = useRouter();

  return (
    <Page title="Select account" bg="secondary">
      <div className="flex flex-col gap-4">
        {accounts.map((account) => {
          const colorInfo = getColorById(account.color);
          return (
            <button
              key={account.id}
              className="bg-card rounded-2xl border p-4 text-left hover:bg-muted/50 transition-colors"
              onClick={() => {
                navigate({ type: "transactionForm", accountId: account.id });
              }}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={cn("w-12 h-12 rounded-xl", colorInfo.bg)} />
                  <div
                    className={cn(
                      "absolute inset-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold",
                      colorInfo.text,
                    )}
                  >
                    {getCurrencySymbol(account.currency as SupportedCurrency)}
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
    </Page>
  );
}
