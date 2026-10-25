import { en } from "./en";
import { ru } from "./ru";
import { translate, type TranslationArgs, type TranslationOf } from "api";

export type SupportedLanguage = "en" | "ru";
export type LanguageMode = "auto" | SupportedLanguage;

type TranslationKey = keyof typeof en;
export type Translation = TranslationOf<typeof en>;

export type Translate = <K extends TranslationKey>(
  key: K,
  ...args: TranslationArgs<Translation, K>
) => string;

const translations: Record<SupportedLanguage, Translation> = {
  en,
  ru,
};

export function getTranslation(language: SupportedLanguage): Translate {
  return (key, ...args) => translate(translations[language], key, ...args);
}
