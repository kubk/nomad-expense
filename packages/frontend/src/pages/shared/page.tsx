import { cn } from "@/lib/utils";
import { PageHeader } from "./page-header";
import { ReactNode } from "react";

export function PlainPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col h-full", className)}>{children}</div>
  );
}

export function Page({
  children,
  className,
  title,
  bg = "primary",
}: {
  children: ReactNode;
  className?: string;
  title?: string | ReactNode;
  bg?: "primary" | "secondary";
}) {
  return (
    <div
      className={cn(
        "flex flex-col h-full",
        bg === "primary" ? "bg-background" : null,
        bg === "secondary" ? "bg-muted" : null,
        className,
      )}
    >
      {title && typeof title === "string" ? <PageHeader title={title} /> : null}
      {title && typeof title !== "string" ? title : null}
      <div className="flex-1 flex flex-col p-4 overflow-auto pb-24">
        {children}
      </div>
    </div>
  );
}
