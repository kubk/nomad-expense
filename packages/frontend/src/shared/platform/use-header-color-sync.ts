import { useTheme } from "@/pages/widgets/theme-provider";
import { useEffect } from "react";
import { platform } from "./platforms";

export function useHeaderColorSync() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    if (resolvedTheme === "dark") {
      platform.syncHeader("#262626");
    } else {
      platform.syncHeader("#f5f5f5");
    }
  }, [resolvedTheme]);
}
