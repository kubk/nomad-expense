export function getWebApp() {
  const webApp = window.Telegram?.WebApp;
  if (webApp && webApp.platform !== "unknown") return webApp;
  return null;
}

export function telegramGetSafeAreaInset() {
  const webAppInset = getWebApp()?.safeAreaInset;
  if (webAppInset) return webAppInset;
  return { top: 0, bottom: 0 };
}

export function initializeTma() {
  const webApp = getWebApp();
  if (!webApp) return;

  webApp.ready();
  webApp.disableVerticalSwipes();
}

// export function useBackButton() {
//   const { navigationStack, pop } = useRouter();

//   useEffect(() => {
//     if (navigationStack.length <= 1) return;
//     const webApp = getWebApp();
//     if (!webApp) return;

//     webApp.BackButton.show();
//     webApp.BackButton.onClick(pop);

//     return () => {
//       webApp.BackButton.hide();
//       webApp.BackButton.offClick(pop);
//     };
//   }, [navigationStack, pop]);
// }
