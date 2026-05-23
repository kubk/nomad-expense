import { en } from "./en";
import { ru } from "./ru";

export type SupportedLanguage = "en" | "ru";
export type LanguageMode = "auto" | SupportedLanguage;

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

export type Translate = <K extends TranslationKey>(
  key: K,
  ...args: TranslationArgs<K>
) => string;

const translations: Record<SupportedLanguage, Translation> = {
  en,
  ru,
};

export function getTranslation(language: SupportedLanguage): Translate {
  return <K extends TranslationKey>(
    key: K,
    ...args: TranslationArgs<K>
  ): string => {
    const entry = translations[language][key];

    if (typeof entry === "function") {
      return (entry as (...args: TranslationArgs<K>) => string)(...args);
    }

    return entry as string;
  };
}
