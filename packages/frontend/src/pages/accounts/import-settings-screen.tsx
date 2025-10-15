import { useState, useEffect } from "react";
import { ArrowLeftIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Page } from "../widgets/page";
import { Footer } from "../widgets/footer";
import { trpc, queryClient } from "@/shared/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RouteByType, useRouter } from "@/shared/stacked-router/router";
import { isFormRoute } from "@/shared/stacked-router/routes";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { bank, type Bank } from "api";

function getTimezones() {
  return [
    { value: "UTC", label: "UTC+0 - London, Dublin" },
    { value: "Europe/Berlin", label: "UTC+1 - Berlin, Paris" },
    { value: "Europe/Athens", label: "UTC+2 - Athens, Cairo" },
    { value: "Europe/Moscow", label: "UTC+3 - Moscow, Istanbul" },
    { value: "Asia/Dubai", label: "UTC+4 - Dubai" },
    { value: "Asia/Kolkata", label: "UTC+5:30 - Mumbai, Delhi" },
    { value: "Asia/Dhaka", label: "UTC+6 - Dhaka" },
    { value: "Asia/Bangkok", label: "UTC+7 - Bangkok, Jakarta" },
    { value: "Asia/Shanghai", label: "UTC+8 - Beijing, Singapore" },
    { value: "Asia/Tokyo", label: "UTC+9 - Tokyo, Seoul" },
    { value: "Australia/Sydney", label: "UTC+10 - Sydney, Melbourne" },
    { value: "Pacific/Auckland", label: "UTC+12 - Auckland" },
    { value: "America/Sao_Paulo", label: "UTC-3 - São Paulo" },
    { value: "America/New_York", label: "UTC-5 - New York, Toronto" },
    { value: "America/Chicago", label: "UTC-6 - Chicago" },
    { value: "America/Denver", label: "UTC-7 - Denver" },
    { value: "America/Los_Angeles", label: "UTC-8 - Los Angeles" },
  ];
}

type Form = {
  bankType: Bank | "None";
  timezone: string;
};

export function ImportSettingsScreen({
  route,
}: {
  route: RouteByType<"importSettings">;
}) {
  const { pop } = useRouter();
  const { accountId } = route;

  const [formData, setFormData] = useState<Form>({
    bankType: "None",
    timezone: "UTC",
  });

  const { data: accounts = [], isLoading: isAccountsLoading } = useQuery(
    trpc.accounts.list.queryOptions(),
  );
  const existingAccount = accounts.find((account) => account.id === accountId);

  if (!isAccountsLoading && !existingAccount) {
    return null;
  }

  const updateImportSettingsMutation = useMutation(
    trpc.accounts.updateImportSettings.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.accounts.list.queryKey(),
        });
        pop();
      },
    }),
  );

  useEffect(() => {
    if (existingAccount) {
      setFormData({
        bankType: existingAccount.bankType || "None",
        timezone: existingAccount.timezone || "UTC",
      });
    }
  }, [existingAccount]);

  const handleSave = () => {
    updateImportSettingsMutation.mutate({
      id: accountId,
      bankType: formData.bankType === "None" ? null : formData.bankType,
      timezone: formData.timezone,
    });
  };

  return (
    <Page title="Import settings" isForm={isFormRoute(route)}>
      <div className="flex-1 space-y-6">
        <div className="flex flex-col gap-2">
          <Label>Bank type</Label>
          {isAccountsLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select
              value={formData.bankType}
              onValueChange={(value: Form["bankType"]) => {
                setFormData((prev) => ({ ...prev, bankType: value }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select bank type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                {bank.map((bankType) => (
                  <SelectItem key={bankType} value={bankType}>
                    {bankType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {formData.bankType !== "None" && (
          <div className="flex flex-col gap-2">
            <Label>Timezone</Label>
            <Select
              value={formData.timezone}
              onValueChange={(value: string) =>
                setFormData((prev) => ({ ...prev, timezone: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {getTimezones().map((timezone) => (
                  <SelectItem key={timezone.value} value={timezone.value}>
                    {timezone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Footer>
        <Button
          size="lg"
          variant="outline"
          type="button"
          onClick={pop}
          disabled={updateImportSettingsMutation.isPending}
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </Button>
        <Button
          size="lg"
          type="button"
          onClick={handleSave}
          disabled={updateImportSettingsMutation.isPending}
        >
          {updateImportSettingsMutation.isPending ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            "Save"
          )}
        </Button>
      </Footer>
    </Page>
  );
}
