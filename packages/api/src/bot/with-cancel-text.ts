import {
  getTranslation,
  type LanguageSource,
} from "../translations/translations";

export const withCancelText = (
  text: string,
  languageSource?: LanguageSource,
) => {
  const { t } = getTranslation(languageSource);
  return t("cancelHint", text);
};
