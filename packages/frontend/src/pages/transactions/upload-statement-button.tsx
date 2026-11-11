import { PlusIcon } from "lucide-react";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { useRef, useState } from "react";
import { accountsStore } from "@/store/accounts-store";
import { t } from "@/translations/translation-store";
import { UploadStatementStore } from "./upload-statement-store";

export function UploadStatementButton({ accountId }: { accountId: string }) {
  const [store] = useState(() => new UploadStatementStore());
  const account = accountsStore.findAccount(accountId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploading = store.uploadMutation.isPending;

  if (!account || !account.bankType) {
    return null;
  }

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await store.upload(file, accountId);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
        className="flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border bg-background px-3 text-sm font-medium shadow-xs transition-transform active:scale-95 disabled:opacity-50"
        onClick={handleClick}
        disabled={isUploading}
        type="button"
      >
        <LoadingSwap isLoading={isUploading}>
          <span className="inline-flex items-center gap-1.5">
            <PlusIcon className="size-4" />
            <span>{t("uploadStatement")}</span>
          </span>
        </LoadingSwap>
      </button>
    </>
  );
}
