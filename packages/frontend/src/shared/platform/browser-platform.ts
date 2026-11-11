import { Platform } from "./platforms";
import { addIosStartupImages } from "./ios-startup-image";

function isStandaloneMode() {
  const navigator = window.navigator as Navigator & { standalone?: boolean };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigator.standalone === true
  );
}

export function createBrowserPlatform(): Platform {
  return {
    initialize() {
      addIosStartupImages();
    },
    safeAreaInset() {
      if (isStandaloneMode()) {
        return {
          top: 0,
          bottom: 6 * 3,
        };
      }

      return { top: 0, bottom: 0 };
    },
    openInternalLink(link: string) {
      window.location.href = link;
    },
  };
}
