import { en } from "./en";
import { ru } from "./ru";

type SupportedLanguage = "en" | "ru";

type BaseTranslation = typeof en;
type TranslationKey = keyof BaseTranslation;
export type Translation = {
  [K in TranslationKey]: BaseTranslation[K] extends (
    ...args: infer Args
  ) => string
    ? (...args: Args) => string
    : string;
};
type TranslationArgs<K extends TranslationKey> = Translation[K] extends (
  ...args: infer Args
) => string
  ? Args
  : [];

export type LanguageSource =
  | string
  | null
  | undefined
  | {
      language?: string | null;
      languageCode?: string | null;
      language_code?: string | null;
    };

const translations: Record<SupportedLanguage, Translation> = {
  en,
  ru,
};

function getLanguageCode(source: LanguageSource): string | null | undefined {
  if (typeof source === "string" || source === null || source === undefined) {
    return source;
  }

  return source.language ?? source.languageCode ?? source.language_code;
}

export function getLanguage(source?: LanguageSource): SupportedLanguage {
  const language = getLanguageCode(source)
    ?.trim()
    .toLowerCase()
    .split(/[-_]/)[0];
  return language === "ru" ? "ru" : "en";
}

export function getTranslation(source?: LanguageSource) {
  const language = getLanguage(source);

  return {
    t<K extends TranslationKey>(key: K, ...args: TranslationArgs<K>): string {
      const entry = translations[language][key];

      if (typeof entry === "function") {
        return (entry as (...args: TranslationArgs<K>) => string)(...args);
      }

      return entry as string;
    },
  };
}
