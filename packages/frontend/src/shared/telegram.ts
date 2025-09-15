export function getWebApp() {
  return window.Telegram?.WebApp;
}

export function isRunningWithinTelegram() {
  return !!getWebApp() && getWebApp()?.platform !== "unknown";
}

export function getInitData() {
  return getWebApp()?.initData ?? null;
}
