import { getSafeAreaInset } from "@/shared/telegram";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Footer({
  children,
  className,
  ref,
}: {
  children: ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 grid grid-cols-2 gap-2",
        className,
      )}
      style={{
        paddingBottom: 16 + getSafeAreaInset().bottom / 2,
      }}
    >
      {children}
    </div>
  );
}
