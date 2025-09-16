import { ReactNode } from "react";
import { useRouter } from "@/shared/stacked-router/router";
import { ArrowLeftIcon } from "lucide-react";
import { getWebApp } from "@/shared/telegram";
import { cn } from "@/lib/utils";

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
      <div
        className={cn("relative flex items-center justify-center p-4", {
          "pt-2": getWebApp(),
        })}
      >
        <div className="absolute left-4">
          <button
            onClick={pop}
            className="bg-background flex items-center gap-1.5 font-medium text-sm shadow-sm dark:border rounded-full py-1.5 px-3 active:scale-95 transition-transform"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </button>
        </div>

        <div className="bg-background font-medium text-sm shadow-sm dark:border rounded-full py-1.5 px-4">
          {title}
        </div>

        {rightSlot && (
          <div className="absolute right-4">
            <div className="bg-background shadow-sm dark:border rounded-full px-2 active:scale-95 transition-transform">
              {rightSlot}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
