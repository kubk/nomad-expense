import { ReactNode } from "react";
import { useRouter } from "@/shared/stacked-router/router";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

export function PageHeader({
  title,
  rightSlot,
}: {
  title: string | ReactNode;
  rightSlot?: ReactNode;
}) {
  const { pop } = useRouter();
  return (
    <div className="sticky top-0">
      <div className="relative flex items-center justify-center p-4">
        <div className="absolute left-4">
          <Button
            variant="outline"
            size="sm"
            onClick={pop}
            className="bg-background shadow-xs border rounded-full active:scale-95 transition-transform"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="bg-background shadow-xs border rounded-full px-4"
        >
          {title}
        </Button>

        {rightSlot && (
          <div className="absolute right-4">
            <div className="bg-background shadow-xs border rounded-full px-2">
              {rightSlot}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
