import { Card, CardContent } from "@/components/ui/card";
import { TransactionItem } from "../widgets/transaction-item";
import { Page } from "../widgets/page";
import { RouteByType } from "@/shared/stacked-router/router";
import { isFormRoute } from "@/shared/stacked-router/routes";
import { getUploadResult } from "@/shared/upload-result-storage";
import { useTranslation } from "@/translations/translation-provider";

export function StatementUploadResultScreen({
  route,
}: {
  route: RouteByType<"statementUploadResult">;
}) {
  const { t } = useTranslation();
  const uploadResult = getUploadResult(route.key);

  if (!uploadResult) {
    return (
      <Page title={t("uploadResultTitle")} isForm={isFormRoute(route)}>
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">{t("uploadResultMissing")}</p>
        </div>
      </Page>
    );
  }

  // Sort transactions by date descending (newest first)
  const sortedAdded = [...uploadResult.added].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const sortedRemoved = [...uploadResult.removed].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <Page title={t("uploadResultTitle")} isForm={isFormRoute(route)}>
      <div className="space-y-4">
        {sortedAdded.length > 0 && (
          <div>
            <div className="text-sm font-medium pb-2 pl-2">
              {t("uploadResultAdded", sortedAdded.length)}
            </div>
            <Card className="border-0 p-0 shadow-sm">
              <CardContent className="p-0">
                {sortedAdded.map((transaction, index) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    borderBottom={index < sortedAdded.length - 1}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {sortedRemoved.length > 0 && (
          <div>
            <div className="text-sm font-medium pb-2 pl-2">
              {t("uploadResultRemoved", sortedRemoved.length)}
            </div>
            <Card className="border-0 p-0 shadow-sm">
              <CardContent className="p-0">
                {sortedRemoved.map((transaction, index) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    borderBottom={index < sortedRemoved.length - 1}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {sortedAdded.length === 0 && sortedRemoved.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                {t("uploadResultEmpty")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Page>
  );
}
