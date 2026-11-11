import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { themeStore, type Theme } from "@/store/theme-store";
import { haptic } from "@/shared/platform/haptics";
import { t } from "@/translations/translation-store";

export function ModeToggle() {
  const themes = [
    {
      name: t("settingsLight"),
      value: "light" as const,
      icon: SunIcon,
    },
    {
      name: t("settingsDark"),
      value: "dark" as const,
      icon: MoonIcon,
    },
    {
      name: t("settingsSystem"),
      value: "system" as const,
      icon: MonitorIcon,
    },
  ];

  return (
    <Tabs
      value={themeStore.theme}
      onValueChange={(value) => {
        haptic("selection");
        themeStore.setTheme(value as Theme);
      }}
    >
      <TabsList className="w-full grid grid-cols-3 h-auto bg-foreground/5 dark:bg-card">
        {themes.map(({ name, value, icon: Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="flex flex-col gap-1 py-2"
          >
            <Icon className="h-4 w-4" />
            <span className="text-xs">{name}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
