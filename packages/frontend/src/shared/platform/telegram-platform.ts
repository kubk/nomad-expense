import { Platform } from "./platforms";
import { lockOrientationWhenPortrait } from "./lock-orientation-when-portrait";

export function getWebApp() {
  const webApp = window.Telegram?.WebApp;
  if (webApp && webApp.platform !== "unknown") return webApp;
  return null;
}

export function createTelegramPlatform(): Platform {
  const webApp = getWebApp();
  if (!webApp) {
    throw new Error("Telegram platform not initialized");
  }

  return {
    initialize() {
      webApp.ready();
      webApp.expand();
      webApp.disableVerticalSwipes();
      lockOrientationWhenPortrait();
    },
    safeAreaInset() {
      return {
        top: webApp.safeAreaInset.top,
        bottom: webApp.safeAreaInset.bottom / 2,
      };
    },
    syncHeader(color: string) {
      webApp.setHeaderColor(color);
    },
    openInternalLink(link: string) {
      webApp.openLink(link);
    },
  };
}
