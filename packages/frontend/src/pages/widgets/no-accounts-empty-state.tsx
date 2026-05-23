import { PlusIcon, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/shared/stacked-router/router";
import { useTranslation } from "@/translations/translation-provider";

export function NoAccountsEmptyState() {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-1.5">
        <Wallet className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-md font-semibold text-foreground">
        {t("accountsNoAccounts")}
      </h3>
      <p className="text-xs text-muted-foreground text-center mt-1">
        {t("accountsNoAccountsDescription")}
      </p>
      <Button
        className="mt-5"
        onClick={() => navigate({ type: "accountForm" }, { replace: true })}
      >
        <PlusIcon className="w-4 h-4" />
        {t("accountsCreate")}
      </Button>
    </div>
  );
}
