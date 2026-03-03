import type { WebHaptics, defaultPatterns } from "web-haptics";
import { getWebApp } from "./telegram-platform";

export type HapticType =
  | "error"
  | "success"
  | "warning"
  | "light"
  | "medium"
  | "heavy"
  | "selection";

const isMobile = () =>
  window.matchMedia && window.matchMedia("(max-width: 600px)").matches;

let webHaptics:
  | { instance: WebHaptics; patterns: typeof defaultPatterns }
  | undefined;

if (!getWebApp()) {
  import("web-haptics").then(({ WebHaptics, defaultPatterns }) => {
    webHaptics = {
      instance: new WebHaptics(),
      patterns: defaultPatterns,
    };
  });
}

const telegramHaptic = (type: HapticType) => {
  const webApp = getWebApp();
  if (!webApp) return;

  const tgPlatform = webApp.platform;
  if (tgPlatform !== "ios" && tgPlatform !== "android") return;

  switch (type) {
    case "error":
    case "success":
    case "warning":
      webApp.HapticFeedback.notificationOccurred(type);
      break;
    case "light":
    case "medium":
    case "heavy":
      webApp.HapticFeedback.impactOccurred(type);
      break;
    case "selection":
      webApp.HapticFeedback.selectionChanged();
      break;
    default:
      return type satisfies never;
  }
};

const browserHaptic = (type: HapticType) => {
  if (!isMobile() || !webHaptics) return;

  const { instance, patterns } = webHaptics;

  switch (type) {
    case "success":
      instance.trigger(patterns.success);
      break;
    case "warning":
      instance.trigger(patterns.warning);
      break;
    case "error":
      instance.trigger(patterns.error);
      break;
    case "light":
      instance.trigger(patterns.light);
      break;
    case "medium":
      instance.trigger(patterns.medium);
      break;
    case "heavy":
      instance.trigger(patterns.heavy);
      break;
    case "selection":
      instance.trigger(patterns.selection);
      break;
    default:
      return type satisfies never;
  }
};

export const haptic = getWebApp() ? telegramHaptic : browserHaptic;
