import { Loader2Icon, PlusIcon } from "lucide-react";
import { trpc } from "@/shared/api";
import { useQuery } from "@tanstack/react-query";
import { uploadStatementFile } from "@/shared/upload-file";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@/shared/stacked-router/router";
import { storeUploadResult } from "@/shared/upload-result-storage";
import { useInvalidateTransactions } from "@/shared/hooks/use-invalidate-transactions";
import { haptic } from "@/shared/platform/haptics";
import { useTranslation } from "@/translations/translation-provider";

export function UploadStatementButton({ accountId }: { accountId: string }) {
  const { t } = useTranslation();
  const { data: accounts = [] } = useQuery(trpc.accounts.list.queryOptions());
  const account = accounts.find((a) => a.id === accountId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const invalidateTransactions = useInvalidateTransactions();
  const [isUploading, setIsUploading] = useState(false);
  const { navigate } = useRouter();

  if (!account || !account.bankType) {
    return null;
  }

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadStatementFile(file, accountId);

      if (result.type === "success") {
        const key = storeUploadResult(result.added, result.removed);
        invalidateTransactions();
        haptic("success");
        toast.success(
          t(
            "uploadStatementSuccess",
            result.removed?.length || 0,
            result.added?.length || 0,
          ),
        );
        navigate({ type: "statementUploadResult", key }, { replace: true });
      } else {
        haptic("error");
        toast.error(result.message || t("uploadStatementFailed"));
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        className="-mx-2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap disabled:opacity-50"
        onClick={handleClick}
        disabled={isUploading}
        type="button"
      >
        {isUploading ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <PlusIcon className="size-4" />
        )}
        <span>
          {isUploading ? t("uploadStatementUploading") : t("uploadStatement")}
        </span>
      </button>
    </>
  );
}
