import { Trash2Icon } from "lucide-react";
import { FormActionButton } from "@/components/ui/form-action-button";
import { haptic } from "@/shared/platform/haptics";
import { t } from "@/translations/translation-store";

export function DeleteActionButton({ onClick }: { onClick: () => void }) {
  return (
    <FormActionButton
      onClick={() => {
        haptic("heavy");
        onClick();
      }}
      icon={<Trash2Icon className="h-4 w-4" />}
    >
      {t("delete")}
    </FormActionButton>
  );
}
