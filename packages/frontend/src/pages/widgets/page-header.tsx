import { ReactNode } from "react";
import { useRouter } from "@/shared/stacked-router/router";
import { ArrowLeftIcon } from "lucide-react";
import { isTelegram } from "@/shared/platform/telegram-platform";
import { cn } from "@/lib/utils";
import { isFormRoute } from "@/shared/stacked-router/routes";
import { haptic } from "@/shared/platform/haptics";

export function PageHeader({
  title,
  rightSlot,
}: {
  title?: string | ReactNode;
  rightSlot?: ReactNode;
}) {
  const { pop, currentRoute } = useRouter();
  const isForm = isFormRoute(currentRoute);
  const telegram = isTelegram();

  const actions = rightSlot ? (
    <div
      className={cn(
        "bg-background shadow-sm rounded-full px-2 active:scale-95 transition-transform",
        { "border shadow-xs": isForm },
      )}
    >
      {rightSlot}
    </div>
  ) : null;

  return (
    <div
      className={cn("sticky top-0 shrink-0", {
        // Screens start below Telegram's controls; lift only the header into that row.
        "-mt-[var(--tg-content-safe-area-inset-top,0px)] pb-6": telegram,
      })}
    >
      <div
        className={cn(
          "relative flex items-center justify-center",
          telegram
            ? "h-[var(--tg-content-safe-area-inset-top,34px)] min-h-[34px] px-24"
            : "p-4 pb-6",
        )}
      >
        {!telegram ? (
          <div className="absolute left-4">
            <button
              onClick={() => {
                haptic("light");
                pop();
              }}
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
        ) : null}

        {title ? (
          <div
            className={cn(
              "bg-background font-medium text-sm shadow-sm rounded-full py-1.5 px-4",
              {
                "border shadow-xs": isForm,
                "max-w-full truncate": telegram,
              },
            )}
          >
            {title}
          </div>
        ) : (
          <div className="h-[34px]" />
        )}

        {actions && !telegram && (
          <div className="absolute right-4">{actions}</div>
        )}
      </div>
      {actions && telegram && (
        <div className="flex justify-end px-4 pt-1">{actions}</div>
      )}
    </div>
  );
}
