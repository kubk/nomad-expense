import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton({ className = "" }: { className?: string }) {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={className}
    >
      <ArrowLeftIcon className="h-4 w-4" />
    </Button>
  );
}
