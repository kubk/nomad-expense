import { useTheme } from "@/pages/widgets/theme-provider";
import { useEffect } from "react";
import { platform } from "./platforms";

export function useHeaderColorSync() {
  const { theme } = useTheme();
  useEffect(() => {
    if (theme === "dark") {
      platform.syncHeader("#262626");
    } else {
      platform.syncHeader("#f5f5f5");
    }
  }, [theme]);
}
