import { FilePlus2Icon, LoaderIcon } from "lucide-react";
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

    if (!account || account.bankType !== "Wise") {
      toast.error("Only Wise bank statements are currently supported");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadStatementFile(file, accountId);

      if (result.success) {
        toast.success(
          `Bank statement processed successfully! Removed ${result.removed || 0} transactions, added ${result.added || 0} new transactions.`,
        );
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An unexpected error occurred");
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
        icon={isUploading ? LoaderIcon : FilePlus2Icon}
        onClick={handleClick}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Upload statement"}
      </FormActionButton>
    </>
  );
}
