import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { palette } from "./palette";
import { themes, type ThemeButtons, type ThemeColors, type ThemeMode } from "./themes";

const STORAGE_KEY = "themeMode";
const DEFAULT_MODE: ThemeMode = "light";

interface ThemeStorage {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
}

// react-native-mmkv requires a JSI-linked native module. It works in EAS dev /
// production builds, but throws in Expo Go. Wrap creation so Expo Go falls back
// to in-memory storage — theme switching still works, it just doesn't persist
// across reloads in Expo Go. Verified persistence happens in dev builds.
function createStorage(): ThemeStorage {
  try {
    const { createMMKV } = require("react-native-mmkv") as typeof import("react-native-mmkv");
    return createMMKV();
  } catch {
    const memory = new Map<string, string>();
    return {
      getString: (key: string) => memory.get(key),
      set: (key: string, value: string) => {
        memory.set(key, value);
      },
    };
  }
}

const storage = createStorage();

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
  buttons: ThemeButtons;
  palette: typeof palette;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredMode(): ThemeMode {
  const stored = storage.getString(STORAGE_KEY);
  if (stored === "light" || stored === "flip" || stored === "dark") {
    return stored;
  }
  return DEFAULT_MODE;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    storage.set(STORAGE_KEY, next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      setMode,
      colors: themes[mode].colors,
      buttons: themes[mode].buttons,
      palette,
    }),
    [mode, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
