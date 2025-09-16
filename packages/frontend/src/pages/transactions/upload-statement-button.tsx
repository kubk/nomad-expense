import { FilePlus2Icon } from "lucide-react";
import { FormActionButton } from "@/components/ui/form-action-button";
import { trpc } from "@/shared/api";
import { useQuery } from "@tanstack/react-query";

export function UploadStatementButton({ accountId }: { accountId: string }) {
  const { data: accounts = [] } = useQuery(trpc.accounts.list.queryOptions());
  const account = accounts.find((a) => a.id === accountId);

  if (!account || !account.bankType) {
    return null;
  }

  return (
    <FormActionButton icon={FilePlus2Icon}>Upload statement</FormActionButton>
  );
}
