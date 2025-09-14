import { ReactNode } from "react";

export function Footer({ children }: { children: ReactNode }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 grid grid-cols-2 gap-2">
      {children}
    </div>
  );
}
