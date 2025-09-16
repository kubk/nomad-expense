import { cn } from "@/lib/utils";
import { PageHeader } from "./page-header";
import { ReactNode } from "react";
import { useRouter } from "@/shared/stacked-router/router";
import { isFormRoute } from "@/shared/stacked-router/routes";

export function Page({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string | ReactNode;
}) {
  const { currentRoute } = useRouter();
  return (
    <div
      className={cn(
        "flex flex-col h-full",
        isFormRoute(currentRoute) ? "bg-background" : "bg-muted",
        className,
      )}
    >
      {title && typeof title === "string" ? <PageHeader title={title} /> : null}
      {title && typeof title !== "string" ? title : null}
      <div className="flex-1 flex flex-col px-4 overflow-auto pb-24 pt-0">
        {children}
      </div>
    </div>
  );
}
