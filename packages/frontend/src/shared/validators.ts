import { t } from "@/translations/translation-store";

export function requiredText(value: string) {
  return value.trim() ? undefined : t("validationRequired");
}

export function positiveAmount(value: string) {
  return Number(value) > 0 ? undefined : t("validationPositiveAmount");
}
