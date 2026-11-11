import { makeAutoObservable } from "mobx";
import { makeMutation } from "mobx-query-lite";
import { toast } from "sonner";
import { uploadStatementFile } from "@/shared/upload-file";
import { storeUploadResult } from "@/shared/upload-result-storage";
import { invalidateTransactions } from "@/shared/invalidate-queries";
import { haptic } from "@/shared/platform/haptics";
import { routerStore } from "@/shared/stacked-router/router-store";
import { t } from "@/translations/translation-store";

export class UploadStatementStore {
  uploadMutation = makeMutation(uploadStatementFile);

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async upload(file: File, accountId: string) {
    const result = await this.uploadMutation.mutateResult(file, accountId);
    if (result.ok && result.data.type === "success") {
      const { added, removed } = result.data;
      const key = storeUploadResult(added, removed);
      invalidateTransactions();
      haptic("success");
      toast.success(
        t("uploadStatementSuccess", removed?.length || 0, added?.length || 0),
      );
      routerStore.navigate(
        { type: "statementUploadResult", key },
        { replace: true },
      );
      return;
    }

    haptic("error");
    const message =
      result.ok && result.data.type !== "success" ? result.data.message : "";
    toast.error(message || t("uploadStatementFailed"));
  }
}
