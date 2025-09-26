import { useTheme } from "@/pages/widgets/theme-provider";
import { useEffect } from "react";
import { useRouter } from "@/shared/stacked-router/router";
import { isFormRoute } from "@/shared/stacked-router/routes";
import { platform } from "./platforms";

export function useHeaderColorSync() {
  const { theme } = useTheme();
  const { currentRoute } = useRouter();
  const isForm = isFormRoute(currentRoute);

  useEffect(() => {
    if (theme === "dark") {
      if (isForm) {
        platform.syncHeader("#0a0a0a");
      } else {
        platform.syncHeader("#262626");
      }
    } else {
      if (isForm) {
        platform.syncHeader("#ffffff");
      } else {
        platform.syncHeader("#f5f5f5");
      }
    }
  }, [theme, isForm]);
}
