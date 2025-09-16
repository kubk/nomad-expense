import { ReactNode } from "react";
import { useRouter } from "@/shared/stacked-router/router";
import { ArrowLeftIcon } from "lucide-react";
import { getWebApp } from "@/shared/telegram";
import { cn } from "@/lib/utils";
import { isFormRoute } from "@/shared/stacked-router/routes";

export function PageHeader({
  title,
  rightSlot,
}: {
  title: string | ReactNode;
  rightSlot?: ReactNode;
}) {
  const { pop, currentRoute } = useRouter();
  const isForm = isFormRoute(currentRoute);
  return (
    <div className="sticky top-0">
      <div
        className={cn("relative flex items-center justify-center p-4", {
          "pt-2": getWebApp(),
        })}
      >
        <div className="absolute left-4">
          <button
            onClick={pop}
            className={cn(
              "bg-background flex items-center gap-1.5 font-medium text-sm shadow-sm rounded-full py-1.5 px-3 active:scale-95 transition-transform",
              {
                "border shadow-xs": isForm,
              },
            )}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </button>
        </div>

        <div
          className={cn(
            "bg-background font-medium text-sm shadow-sm rounded-full py-1.5 px-4",
            {
              "border shadow-xs": isForm,
            },
          )}
        >
          {title}
        </div>

        {rightSlot && (
          <div className="absolute right-4">
            <div
              className={cn(
                "bg-background shadow-sm rounded-full px-2 active:scale-95 transition-transform",
                {
                  "border shadow-xs": isForm,
                },
              )}
            >
              {rightSlot}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
