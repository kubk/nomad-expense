import { createBrowserPlatform } from "./browser-platform";
import { createTelegramPlatform, isTelegram } from "./telegram-platform";

export type Platform = {
  initialize(): void;
  syncHeader(color: string): void;
  safeAreaInset(): { top: number; bottom: number };
  openInternalLink(link: string): void;
};

export const platform = isTelegram()
  ? createTelegramPlatform()
  : createBrowserPlatform();
