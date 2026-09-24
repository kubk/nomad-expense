import { env } from "./env";
import { getWebApp } from "./platform/telegram-platform";
import { telegramAuthMethod } from "api";

const authTokenKey = "authToken";

localStorage.removeItem("authQuery");

export function getAuthToken() {
  if (env.VITE_STAGE === "local" && env.VITE_USER_ID) {
    return telegramAuthMethod.u + env.VITE_USER_ID;
  }
  const webApp = getWebApp();
  if (webApp) {
    return telegramAuthMethod.miniApp + webApp.initData;
  }
  const authToken = localStorage.getItem(authTokenKey) || "";
  return authToken ? `${telegramAuthMethod.browser} ${authToken}` : "";
}

export function saveAuthToken(authToken: string) {
  localStorage.setItem(authTokenKey, authToken);
}

export function clearAuthToken() {
  localStorage.removeItem(authTokenKey);
}
