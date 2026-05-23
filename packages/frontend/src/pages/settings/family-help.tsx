import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { EyeIcon, UsersIcon } from "lucide-react";
import { useTranslation } from "@/translations/translation-provider";

export function FamilyHelp({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="pb-4">
          <DrawerTitle />
          <DrawerDescription />
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-6">
          <div className="space-y-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                <UsersIcon className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-md font-medium text-foreground mb-0.5">
                  {t("familyHelpShareTitle")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("familyHelpShareDescription")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                <EyeIcon className="size-4" />
              </div>
              <div>
                <p className="text-md font-medium text-foreground mb-0.5">
                  {t("familyHelpVisibilityTitle")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("familyHelpVisibilityDescription")}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full"
              size="lg"
            >
              {t("gotIt")}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
