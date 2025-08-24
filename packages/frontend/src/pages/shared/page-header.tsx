import { ReactNode } from "react";
import { BackButton } from "../../shared/back-button";

export function PageHeader({
  title,
  rightSlot,
}: {
  title: string | ReactNode;
  rightSlot?: ReactNode;
}) {
  return (
    <div className="bg-background border-b sticky top-0 z-10">
      <div className="relative flex items-center justify-center p-4">
        <div className="absolute left-4">
          <BackButton />
        </div>
        <h1 className="font-semibold text-foreground">{title}</h1>
        <div className="absolute right-4">{rightSlot}</div>
      </div>
    </div>
  );
}
