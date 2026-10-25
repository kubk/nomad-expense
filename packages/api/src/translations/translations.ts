import { en } from "./en";
import { ru } from "./ru";
import {
  translate,
  type TranslationArgs,
  type TranslationOf,
} from "./translate";

type SupportedLanguage = "en" | "ru";

type TranslationKey = keyof typeof en;
export type Translation = TranslationOf<typeof en>;

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
    t<K extends TranslationKey>(
      key: K,
      ...args: TranslationArgs<Translation, K>
    ): string {
      return translate(translations[language], key, ...args);
    },
  };
}
