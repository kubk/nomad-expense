import { LucideIcon } from "lucide-react";

export function FormActionButton({
  children,
  icon: Icon,
  onClick,
}: {
  children: React.ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-4 py-3 bg-muted active:scale-95 rounded-xl transition-transform text-sm font-medium text-foreground"
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}
