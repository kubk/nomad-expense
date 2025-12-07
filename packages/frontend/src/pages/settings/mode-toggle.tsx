import { MoonIcon, SunIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "../widgets/theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      name: "Light",
      value: "light" as const,
      icon: SunIcon,
    },
    {
      name: "Dark",
      value: "dark" as const,
      icon: MoonIcon,
    },
  ];

  return (
    <Tabs
      value={theme}
      onValueChange={(value) => setTheme(value as "light" | "dark")}
    >
      <TabsList className="w-full grid grid-cols-2 h-auto">
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
