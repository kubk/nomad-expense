import { cn } from "@/lib/utils";
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
