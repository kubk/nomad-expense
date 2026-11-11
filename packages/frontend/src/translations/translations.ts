import { en } from "./en";
import { type TranslationArgs, type TranslationOf } from "api";

export type SupportedLanguage = "en" | "ru";
export type LanguageMode = "auto" | SupportedLanguage;

type TranslationKey = keyof typeof en;
export type Translation = TranslationOf<typeof en>;

export type Translate = <K extends TranslationKey>(
  key: K,
  ...args: TranslationArgs<Translation, K>
) => string;
