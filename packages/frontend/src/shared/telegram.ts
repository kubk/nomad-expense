export function getWebApp() {
  return window.Telegram?.WebApp;
}

export function isRunningWithinTelegram() {
  return !!getWebApp() && getWebApp()?.platform !== "unknown";
}

export function getInitData() {
  return getWebApp()?.initData ?? null;
}

export function getSafeAreaInset() {
  return getWebApp()?.safeAreaInset ?? { top: 0, bottom: 0, left: 0, right: 0 };
}

export function getContentSafeAreaInset() {
  return getWebApp()?.contentSafeAreaInset ?? { top: 0, bottom: 0, left: 0, right: 0 };
}

export function initializeTma() {
  if (!isRunningWithinTelegram()) return;
  const webApp = getWebApp();
  if (!webApp) return;

  webApp.ready();
  webApp.disableVerticalSwipes();
}
