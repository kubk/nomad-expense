import { useTheme } from "@/pages/widgets/theme-provider";
import { useEffect } from "react";
import { platform } from "./platforms";

export function useHeaderColorSync(isForm: boolean) {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    if (resolvedTheme === "dark") {
      platform.syncHeader(isForm ? "#0a0a0a" : "#262626");
    } else {
      platform.syncHeader(isForm ? "#ffffff" : "#f5f5f5");
    }
  }, [resolvedTheme, isForm]);
}
