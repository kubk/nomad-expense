import { makeAutoObservable } from "mobx";
import { translate } from "api";
import { getWebApp } from "@/shared/platform/telegram-platform";
import { storageGet, storageSet } from "@/shared/platform/telegram-storage";
import { en } from "./en";
import { ru } from "./ru";
import type {
  LanguageMode,
  SupportedLanguage,
  Translate,
  Translation,
} from "./translations";

const LANGUAGE_MODE_KEY = "expense-tracker-language-mode";

const translations: Record<SupportedLanguage, Translation> = {
  en,
  ru,
};

function parseLanguageMode(value: string | null | undefined): LanguageMode {
  return value === "auto" || value === "en" || value === "ru" ? value : "auto";
}

function normalizeLanguage(
  value: string | null | undefined,
): SupportedLanguage {
  const language = value?.trim().toLowerCase().split(/[-_]/)[0];
  return language === "ru" ? "ru" : "en";
}

function getAutoLanguage(): SupportedLanguage {
  const telegramLanguage = getWebApp()?.initDataUnsafe.user?.language_code;
  return normalizeLanguage(telegramLanguage ?? navigator.language);
}

class TranslationStore {
  languageMode: LanguageMode = "auto";

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.loadLanguageMode();
  }

  get language(): SupportedLanguage {
    return this.languageMode === "auto" ? getAutoLanguage() : this.languageMode;
  }

  async loadLanguageMode() {
    this.languageMode = parseLanguageMode(await storageGet(LANGUAGE_MODE_KEY));
  }

  setLanguageMode(languageMode: LanguageMode) {
    this.languageMode = languageMode;
    storageSet(LANGUAGE_MODE_KEY, languageMode);
  }
}

export const translationStore = new TranslationStore();

// Reads the observable language, so observer components re-render when it changes
export const t: Translate = (key, ...args) =>
  translate(translations[translationStore.language], key, ...args);
