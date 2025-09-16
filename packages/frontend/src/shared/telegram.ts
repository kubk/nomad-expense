import { useEffect } from "react";
import { useRouter } from "./stacked-router/router";

export function getWebApp() {
  const webApp = window.Telegram?.WebApp;
  if (webApp && webApp.platform !== "unknown") return webApp;
  return null;
}

export function getSafeAreaInset() {
  return getWebApp()?.safeAreaInset ?? { top: 0, bottom: 0, left: 0, right: 0 };
}

export function getContentSafeAreaInset() {
  return (
    getWebApp()?.contentSafeAreaInset ?? {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    }
  );
}

export function initializeTma() {
  const webApp = getWebApp();
  if (!webApp) return;

  webApp.ready();
  webApp.disableVerticalSwipes();
}

export function useBackButton() {
  const { navigationStack, pop } = useRouter();

  useEffect(() => {
    if (navigationStack.length <= 1) return;
    const webApp = getWebApp();
    if (!webApp) return;

    webApp.BackButton.show();
    webApp.BackButton.onClick(pop);

    return () => {
      webApp.BackButton.hide();
      webApp.BackButton.offClick(pop);
    };
  }, [navigationStack, pop]);
}
