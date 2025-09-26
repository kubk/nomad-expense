import { Platform } from "./platforms";

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
      webApp.disableVerticalSwipes();
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
  };
}

// export function useBackButton() {
//   const { navigationStack, pop } = useRouter();

//   useEffect(() => {
//     if (navigationStack.length <= 1) return;
//     const webApp = getWebApp();
//     if (!webApp) return;

//     webApp.BackButton.show();
//     webApp.BackButton.onClick(pop);

//     return () => {
//       webApp.BackButton.hide();
//       webApp.BackButton.offClick(pop);
//     };
//   }, [navigationStack, pop]);
// }
