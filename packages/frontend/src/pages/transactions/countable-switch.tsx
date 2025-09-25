import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ArrowRightLeftIcon, CircleQuestionMarkIcon } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import { TransactionForm } from "./transaction-form-screen";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

export function CountableSwitch({
  formData,
  setFormData,
  isTransactionLoading,
}: {
  formData: TransactionForm;
  setFormData: Dispatch<SetStateAction<TransactionForm>>;
  isTransactionLoading: boolean;
}) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2 pl-0.5">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            {isTransactionLoading ? (
              <Skeleton className="h-5 w-8" />
            ) : (
              <Switch
                checked={!formData.isCountable}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isCountable: !checked,
                  }))
                }
              />
            )}
            <span className="text-sm text-muted-foreground">
              Exclude from totals
            </span>
          </label>
          <CircleQuestionMarkIcon
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsHelpOpen(true);
            }}
            className="size-4 text-muted-foreground active:scale-95 transition-transform cursor-pointer flex-shrink-0"
          />
        </div>
      </div>

      <Drawer open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle />
            <DrawerDescription />
          </DrawerHeader>

          <div className="px-4 pb-6 space-y-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                <ArrowRightLeftIcon className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-md font-medium text-foreground mb-0.5">
                  Why exclude transactions?
                </p>
                <p className="text-sm text-muted-foreground">
                  When you transfer money between your accounts, it's not really
                  spending - it's just moving money. Mark these transactions as
                  "excluded" so they don't affect your spending totals.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={() => setIsHelpOpen(false)}
                className="w-full"
                size="lg"
              >
                Got it
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
