import { Trash2Icon } from "lucide-react";
import { FormActionButton } from "@/components/ui/form-action-button";
import { haptic } from "@/shared/platform/haptics";
import { useTranslation } from "@/translations/translation-provider";

export function DeleteActionButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();

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
