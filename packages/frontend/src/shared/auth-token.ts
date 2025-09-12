import { env } from "./env";

export const authQueryKey = "authQuery";

export function getAuthToken() {
  if (env.VITE_STAGE === "local" && env.VITE_AUTH_QUERY) {
    return env.VITE_AUTH_QUERY;
  }
  return localStorage.getItem(authQueryKey) || "";
}

export function saveAuthToken(authQuery: string) {
  localStorage.setItem(authQueryKey, authQuery);
}

export function clearAuthToken() {
  localStorage.removeItem(authQueryKey);
}
