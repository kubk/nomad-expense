import { LoadingSwap } from "@/components/ui/loading-swap";

export function FormActionButton({
  children,
  icon,
  isLoading = false,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-4 py-3 bg-muted active:scale-95 rounded-xl transition-transform text-sm font-medium text-foreground disabled:opacity-50"
    >
      <LoadingSwap isLoading={isLoading}>
        <span className="inline-flex items-center gap-2">
          {icon}
          {children}
        </span>
      </LoadingSwap>
    </button>
  );
}
