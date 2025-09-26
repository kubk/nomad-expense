import { createBrowserPlatform } from "./browser-platform";
import { createTelegramPlatform, getWebApp } from "./telegram-platform";

export type Platform = {
  initialize(): void;
  syncHeader(color: string): void;
  safeAreaInset(): { top: number; bottom: number };
};

export const platform = getWebApp()
  ? createTelegramPlatform()
  : createBrowserPlatform();
