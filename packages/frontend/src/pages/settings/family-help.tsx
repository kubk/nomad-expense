import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { EyeIcon, UsersIcon } from "lucide-react";

export function FamilyHelp({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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
                  Share expenses together
                </p>
                <p className="text-sm text-muted-foreground">
                  When you invite someone to your family, they'll be able to see
                  and add transactions to all your shared bank accounts
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                <EyeIcon className="size-4" />
              </div>
              <div>
                <p className="text-md font-medium text-foreground mb-0.5">
                  Everyone sees everything
                </p>
                <p className="text-sm text-muted-foreground">
                  All family members can see all transactions and accounts. Only
                  invite people you trust
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
              Got it
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
