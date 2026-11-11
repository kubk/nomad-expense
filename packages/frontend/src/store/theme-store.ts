import { action, autorun, makeAutoObservable } from "mobx";

export type Theme = "dark" | "light" | "system";
type ResolvedTheme = Exclude<Theme, "system">;

const storageKey = "nomad-expense-theme";
const darkSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

class ThemeStore {
  theme: Theme = (localStorage.getItem(storageKey) as Theme) || "system";
  systemTheme: ResolvedTheme = darkSchemeQuery.matches ? "dark" : "light";

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });

    darkSchemeQuery.addEventListener(
      "change",
      action((event: MediaQueryListEvent) => {
        this.systemTheme = event.matches ? "dark" : "light";
      }),
    );

    autorun(() => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(this.resolvedTheme);
    });
  }

  get resolvedTheme(): ResolvedTheme {
    return this.theme === "system" ? this.systemTheme : this.theme;
  }

  setTheme(theme: Theme) {
    localStorage.setItem(storageKey, theme);
    this.theme = theme;
  }
}

export const themeStore = new ThemeStore();
