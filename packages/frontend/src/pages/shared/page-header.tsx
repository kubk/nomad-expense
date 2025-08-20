import { ReactNode } from "react";
import { BackButton } from "../../shared/back-button";

export function PageHeader({
  title,
  rightSlot,
}: {
  title: string;
  rightSlot?: ReactNode;
}) {
  return (
    <div className="bg-background border-b sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        <BackButton />
        <h1 className="font-semibold text-foreground">{title}</h1>
        <div className="w-[60px] flex justify-end">{rightSlot}</div>
      </div>
    </div>
  );
}
