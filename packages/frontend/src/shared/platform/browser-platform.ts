import { Platform } from "./platforms";

function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

export function createBrowserPlatform(): Platform {
  return {
    initialize() {},
    safeAreaInset() {
      if (isStandaloneMode()) {
        return {
          top: 0,
          bottom: 6 * 3,
        };
      }

      return { top: 0, bottom: 0 };
    },
    syncHeader(color: string) {
      if (!isStandaloneMode()) {
        return;
      }
      let metaThemeColor = document.querySelector(
        "meta[name='theme-color']",
      ) as HTMLMetaElement;

      if (!metaThemeColor) {
        metaThemeColor = document.createElement("meta");
        metaThemeColor.name = "theme-color";
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.content = color;
    },
  };
}
