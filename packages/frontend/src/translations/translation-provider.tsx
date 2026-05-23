import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getWebApp } from "@/shared/platform/telegram-platform";
import { storageGet, storageSet } from "@/shared/platform/telegram-storage";
import {
  getTranslation,
  type LanguageMode,
  type SupportedLanguage,
  type Translate,
} from "./translations";

type TranslationContextValue = {
  language: SupportedLanguage;
  languageMode: LanguageMode;
  setLanguageMode: (languageMode: LanguageMode) => void;
  t: Translate;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);
const LANGUAGE_MODE_KEY = "expense-tracker-language-mode";

function parseLanguageMode(value: string | null | undefined): LanguageMode {
  return value === "auto" || value === "en" || value === "ru" ? value : "auto";
}

function normalizeLanguage(
  value: string | null | undefined,
): SupportedLanguage {
  const language = value?.trim().toLowerCase().split(/[-_]/)[0];
  return language === "ru" ? "ru" : "en";
}

function getTelegramLanguage(): string | undefined {
  return getWebApp()?.initDataUnsafe.user?.language_code;
}

function getAutoLanguage(): SupportedLanguage {
  return normalizeLanguage(getTelegramLanguage() ?? navigator.language);
}

async function readLanguageMode(): Promise<LanguageMode> {
  return parseLanguageMode(await storageGet(LANGUAGE_MODE_KEY));
}

function writeLanguageMode(languageMode: LanguageMode): Promise<void> {
  return storageSet(LANGUAGE_MODE_KEY, languageMode);
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [languageMode, setLanguageModeState] = useState<LanguageMode>("auto");

  useEffect(() => {
    let cancelled = false;

    readLanguageMode().then((storedLanguageMode) => {
      if (!cancelled) {
        setLanguageModeState(storedLanguageMode);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const language = languageMode === "auto" ? getAutoLanguage() : languageMode;

  const setLanguageMode = useCallback((nextLanguageMode: LanguageMode) => {
    setLanguageModeState(nextLanguageMode);
    writeLanguageMode(nextLanguageMode);
  }, []);

  const value = useMemo<TranslationContextValue>(
    () => ({
      language,
      languageMode,
      setLanguageMode,
      t: getTranslation(language),
    }),
    [language, languageMode, setLanguageMode],
  );

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }

  return context;
}
