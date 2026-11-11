import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { haptic } from "@/shared/platform/haptics";
import { translationStore } from "@/translations/translation-store";
import type { LanguageMode } from "@/translations/translations";

const languageModes: LanguageMode[] = ["auto", "en", "ru"];
const languageLabels: Record<LanguageMode, string> = {
  auto: "Auto",
  en: "English",
  ru: "Русский",
};

export function LanguageSetting() {
  return (
    <Select
      value={translationStore.languageMode}
      onValueChange={(value) => {
        haptic("selection");
        translationStore.setLanguageMode(value as LanguageMode);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languageModes.map((languageMode) => (
          <SelectItem key={languageMode} value={languageMode}>
            {languageLabels[languageMode]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
