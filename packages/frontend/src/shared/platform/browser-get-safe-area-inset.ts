function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

function getSafeAreaValue(property: string): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    property,
  );
  const numValue = parseFloat(value);
  return !isNaN(numValue) ? numValue : 0;
}

export function browserGetSafeAreaInset() {
  if (isStandaloneMode()) {
    const safeAreaTop = getSafeAreaValue("env(safe-area-inset-top)");
    const safeAreaBottom = getSafeAreaValue("env(safe-area-inset-bottom)");

    return {
      top: safeAreaTop,
      bottom: safeAreaBottom,
    };
  }

  return { top: 0, bottom: 0 };
}
