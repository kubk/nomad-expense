import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { haptic } from "@/shared/platform/haptics";
import { useTranslation } from "@/translations/translation-provider";
import type { LanguageMode } from "@/translations/translations";

const languageModes: LanguageMode[] = ["auto", "en", "ru"];
const languageLabels: Record<LanguageMode, string> = {
  auto: "Auto",
  en: "English",
  ru: "Русский",
};

export function LanguageSetting() {
  const { languageMode, setLanguageMode } = useTranslation();

  return (
    <Select
      value={languageMode}
      onValueChange={(value) => {
        haptic("selection");
        setLanguageMode(value as LanguageMode);
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
