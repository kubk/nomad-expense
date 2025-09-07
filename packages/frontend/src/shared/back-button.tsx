import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "./stacked-router/router";

export function BackButton() {
  const { pop } = useRouter();

  return (
    <Button variant="ghost" size="sm" onClick={pop}>
      <ArrowLeftIcon className="h-4 w-4" />
    </Button>
  );
}
