import { MoonIcon, SunIcon, MonitorIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "../shared/theme-provider";
import { cn } from "@/lib/utils";

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
    {
      name: "System",
      value: "system" as const,
      icon: MonitorIcon,
    },
  ];

  return (
    <div className="flex rounded-lg border p-1 bg-muted">
      {themes.map(({ name, value, icon: Icon }) => (
        <Button
          key={value}
          variant={theme === value ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme(value)}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 h-auto py-2 px-3",
            theme === value
              ? "bg-background text-foreground shadow-sm"
              : "hover:bg-background/50",
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="text-xs">{name}</span>
        </Button>
      ))}
    </div>
  );
}
