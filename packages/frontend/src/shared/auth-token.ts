import { env } from "./env";
import { getInitData, isRunningWithinTelegram } from "./telegram";
import { telegramAuthMethod } from "api";

export const authQueryKey = "authQuery";

export function getAuthToken() {
  if (env.VITE_STAGE === "local" && env.VITE_AUTH_QUERY) {
    return telegramAuthMethod.loginWidget + env.VITE_AUTH_QUERY;
  }
  if (isRunningWithinTelegram()) {
    return telegramAuthMethod.miniApp + getInitData();
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
