import { env } from "./env";
import { getWebApp } from "./platform/telegram-platform";
import { telegramAuthMethod } from "api";

export const authQueryKey = "authQuery";

export function getAuthToken() {
  if (env.VITE_STAGE === "local" && env.VITE_USER_ID) {
    return telegramAuthMethod.u + env.VITE_USER_ID;
  }
  const webApp = getWebApp();
  if (webApp) {
    return telegramAuthMethod.miniApp + webApp.initData;
  }
  const authQueryValue = localStorage.getItem(authQueryKey) || "";
  if (!authQueryValue) return "";

  return telegramAuthMethod.loginWidget + authQueryValue;
}

export function saveAuthToken(authQuery: string) {
  localStorage.setItem(authQueryKey, authQuery);
}

export function clearAuthToken() {
  localStorage.removeItem(authQueryKey);
}
