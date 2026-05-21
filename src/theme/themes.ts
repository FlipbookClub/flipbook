// Semantic tokens — resolved per theme mode.
// Components consume these via `useTheme().colors` (see ThemeContext).
// Flip + Dark values to be verified against Figma during TASK-008 visual QA.
export type ThemeMode = "light" | "flip" | "dark";

export interface ThemeColors {
  surfacePrimary: string;
  surfaceSecondary: string;
  surfaceWarm: string;
  surfaceElevated: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  shadowOpacity: number; // multiplier applied to base shadow opacity
}

export const themes: Record<ThemeMode, ThemeColors> = {
  light: {
    surfacePrimary: "#fdfdfd",
    surfaceSecondary: "#f1f4fc",
    surfaceWarm: "#f7f3e3",
    surfaceElevated: "#fdfdfd",
    border: "#b4bfed",
    textPrimary: "#3b3a6d",
    textSecondary: "#464646",
    textMuted: "#989898",
    textInverse: "#fdfdfd",
    shadowOpacity: 1.0,
  },
  flip: {
    surfacePrimary: "#3b3a6d",
    surfaceSecondary: "#48448f",
    surfaceWarm: "#5d3a5a",
    surfaceElevated: "#252442",
    border: "#5752b0",
    textPrimary: "#f7f3e3",
    textSecondary: "#b4bfed",
    textMuted: "#5752b0",
    textInverse: "#3b3a6d",
    shadowOpacity: 5.0,
  },
  dark: {
    surfacePrimary: "#121212",
    surfaceSecondary: "#2B2B2B",
    surfaceWarm: "#414141",
    surfaceElevated: "#161616",
    border: "#414141",
    textPrimary: "#fdfdfd",
    textSecondary: "#D9D9D9",
    textMuted: "#828282",
    textInverse: "#3b3a6d",
    shadowOpacity: 10.0,
  },
};
