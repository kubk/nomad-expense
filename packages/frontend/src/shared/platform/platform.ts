import { browserGetSafeAreaInset } from "./browser-get-safe-area-inset";
import { getWebApp, telegramGetSafeAreaInset } from "./telegram";

export function getSafeAreaInset() {
  const webApp = getWebApp();
  if (webApp) {
    const tgInset = telegramGetSafeAreaInset();

    return {
      top: tgInset.top,
      bottom: tgInset.bottom / 2,
    };
  }
  return browserGetSafeAreaInset();
}
