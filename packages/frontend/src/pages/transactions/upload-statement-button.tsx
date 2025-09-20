import { FilePlus2Icon, Loader2Icon } from "lucide-react";
import { FormActionButton } from "@/components/ui/form-action-button";
import { trpc } from "@/shared/api";
import { useQuery } from "@tanstack/react-query";
import { uploadStatementFile } from "@/shared/upload-file";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function UploadStatementButton({ accountId }: { accountId: string }) {
  const { data: accounts = [] } = useQuery(trpc.accounts.list.queryOptions());
  const account = accounts.find((a) => a.id === accountId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

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
        toast.success(
          `Bank statement uploaded! Removed ${result.removed || 0}, added ${result.added || 0} transactions`,
        );
      } else {
        toast.error(result.message || "Upload failed");
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
        accept=".pdf,.csv"
        onChange={handleFileSelect}
        className="hidden"
      />
      <FormActionButton
        icon={
          isUploading ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <FilePlus2Icon className="h-4 w-4" />
          )
        }
        onClick={handleClick}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Upload statement"}
      </FormActionButton>
    </>
  );
}
