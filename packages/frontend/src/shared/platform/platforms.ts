import { createBrowserPlatform } from "./browser-platform";
import { createTelegramPlatform, isTelegram } from "./telegram-platform";

export type Platform = {
  initialize(): void;
  safeAreaInset(): { top: number; bottom: number };
  openInternalLink(link: string): void;
};

export const platform = isTelegram()
  ? createTelegramPlatform()
  : createBrowserPlatform();

export const isMobile = () =>
  window.matchMedia && window.matchMedia("(max-width: 600px)").matches;
