"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeMode = "light" | "flip" | "dark";

const THEMES: ThemeMode[] = ["light", "flip", "dark"];
const STORAGE_KEY = "flipbook.web.theme";
const DEFAULT_THEME: ThemeMode = "flip";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  cycle: () => void;
  modes: ThemeMode[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_THEME);

  // Hydrate from localStorage on mount. SSR ships Flip — once the script
  // runs, swap to the user's saved preference if any.
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved && THEMES.includes(saved as ThemeMode)) {
      const next = saved as ThemeMode;
      setModeState(next);
      document.documentElement.setAttribute("data-theme", next);
    }
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore quota / private-mode errors — theme just reverts on next load.
    }
  }, []);

  const cycle = useCallback(() => {
    setModeState((prev) => {
      const idx = THEMES.indexOf(prev);
      const next = THEMES[(idx + 1) % THEMES.length];
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, setMode, cycle, modes: THEMES }),
    [mode, setMode, cycle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
