import { getWebApp } from "./telegram-platform";

let stopWaitingForPortraitLock: (() => void) | null = null;

function isPortraitOrientation(): boolean {
  if (window.screen?.orientation?.type) {
    return window.screen.orientation.type.startsWith("portrait");
  }

  if (window.matchMedia) {
    return window.matchMedia("(orientation: portrait)").matches;
  }

  return window.innerHeight >= window.innerWidth;
}

function subscribeToPortraitOrientationChange(listener: () => void): () => void {
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia("(orientation: portrait)");

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }

    if (mediaQuery.addListener) {
      mediaQuery.addListener(listener);
      return () => mediaQuery.removeListener(listener);
    }
  }

  window.addEventListener("resize", listener);
  return () => window.removeEventListener("resize", listener);
}

export function lockOrientationWhenPortrait(): void {
  const webApp = getWebApp();
  if (!webApp?.isVersionAtLeast("8.0")) {
    return;
  }

  if (isPortraitOrientation()) {
    webApp.lockOrientation();
    stopWaitingForPortraitLock?.();
    stopWaitingForPortraitLock = null;
    return;
  }

  if (stopWaitingForPortraitLock) {
    return;
  }

  const tryLock = () => {
    if (!isPortraitOrientation()) {
      return;
    }

    const latestWebApp = getWebApp();
    if (!latestWebApp?.isVersionAtLeast("8.0")) {
      return;
    }

    latestWebApp.lockOrientation();
    stopWaitingForPortraitLock?.();
    stopWaitingForPortraitLock = null;
  };

  stopWaitingForPortraitLock = subscribeToPortraitOrientationChange(tryLock);
}
