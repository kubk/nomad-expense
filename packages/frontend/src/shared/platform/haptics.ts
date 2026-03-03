import type { WebHaptics, defaultPatterns } from "web-haptics";

export type HapticType =
  | "error"
  | "success"
  | "warning"
  | "light"
  | "medium"
  | "heavy"
  | "selection";

let webHaptics:
  | { instance: WebHaptics; patterns: typeof defaultPatterns }
  | undefined;

const isMobile = () =>
  window.matchMedia && window.matchMedia("(max-width: 600px)").matches;

import("web-haptics").then(({ WebHaptics, defaultPatterns }) => {
  webHaptics = {
    instance: new WebHaptics(),
    patterns: defaultPatterns,
  };
});

export const haptic = (type: HapticType) => {
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
