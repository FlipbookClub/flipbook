// Semantic tokens — resolved per theme mode.
// Components consume these via `useTheme().colors` and `useTheme().buttons`.
//
// Values were verified against the Figma file using
// `mcp__figma__get_variable_defs` on Light/Flip/Dark frames during TASK-008
// verification. Tokens annotated with `(Figma)` were directly observed. Tokens
// annotated with `(derived)` were not present on the inspected frames (Figma
// doesn't render every button state per mode) and are reasoned defaults — flag
// for revisit when the matching state appears in a designed screen.
export type ThemeMode = "light" | "flip" | "dark";

export interface ThemeColors {
  surfacePrimary: string;
  surfaceSecondary: string;
  surfaceAccent: string;
  surfaceWarm: string;
  surfaceElevated: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textAccent: string;
  textAlt: string;
  textInverse: string;
  shadowOpacity: number;
}

interface ButtonStateColors {
  surface: string;
  text: string;
}

interface ButtonVariantTokens {
  default: ButtonStateColors;
  hover: ButtonStateColors;
  pressed: ButtonStateColors;
  muted: ButtonStateColors;
}

interface AltButtonTokens {
  default: { text: string };
  hover: { text: string };
  pressed: { text: string };
  muted: { text: string };
}

export interface ThemeButtons {
  primary: ButtonVariantTokens;
  secondary: ButtonVariantTokens;
  alt: AltButtonTokens;
}

export interface Theme {
  colors: ThemeColors;
  buttons: ThemeButtons;
}

const lightTheme: Theme = {
  colors: {
    surfacePrimary: "#fdfdfd", // Figma: Surfaces/Primary
    surfaceSecondary: "#f1f4fc", // Figma: Surfaces/Secondary
    surfaceAccent: "#5d3a5a", // Figma: Surfaces/Accent (Muted Plum)
    surfaceWarm: "#f7f3e3", // Figma: BrandSecondary/WarmIvory
    surfaceElevated: "#fdfdfd",
    border: "#b4bfed", // Figma: Surfaces/Borders
    textPrimary: "#3b3a6d", // Figma: Text/Primary-text
    textSecondary: "#464646", // Figma: Text/Secondary-text
    textMuted: "#989898", // Figma: Text/Muted-text
    textAccent: "#5d3a5a", // Figma: Text/Accent-text
    textAlt: "#2f2f2f", // Figma: Text/Alt-text
    textInverse: "#fdfdfd",
    shadowOpacity: 1.0,
  },
  buttons: {
    primary: {
      default: { surface: "#3b3a6d", text: "#fdfdfd" }, // Figma
      hover: { surface: "#48448f", text: "#fdfdfd" }, // Figma
      pressed: { surface: "#252442", text: "#fdfdfd" }, // Figma
      muted: { surface: "#b4bfed", text: "#fdfdfd" }, // Figma
    },
    secondary: {
      default: { surface: "#f83b3b", text: "#fdfdfd" }, // Figma
      hover: { surface: "#ff6b6b", text: "#fdfdfd" }, // Figma
      pressed: { surface: "#e51d1d", text: "#fdfdfd" }, // Figma
      muted: { surface: "#ffc7c7", text: "#fdfdfd" }, // Figma
    },
    alt: {
      default: { text: "#f83b3b" }, // Figma: Button/Text/Alt-default
      hover: { text: "#ff6b6b" }, // Figma
      pressed: { text: "#e51d1d" }, // Figma
      muted: { text: "#ffc7c7" }, // Figma
    },
  },
};

const flipTheme: Theme = {
  colors: {
    surfacePrimary: "#252442", // Figma: Surfaces/Primary (Primary-pressed indigo)
    surfaceSecondary: "#d1d8e0", // Figma: Surfaces/Secondary
    surfaceAccent: "#ff6b6b", // Figma: Surfaces/Accent (Coral)
    surfaceWarm: "#5d3a5a", // derived — no Figma value observed in Flip frames
    surfaceElevated: "#252442",
    border: "#ffe1e1", // Figma: Surfaces/Borders (light pink)
    textPrimary: "#f7f3e3", // Figma: Text/Primary-text (Warm Ivory)
    textSecondary: "#d1d8e0", // Figma: Text/Secondary-text
    textMuted: "#7c7c7c", // Figma: Text/Muted-text
    textAccent: "#ff6b6b", // Figma: Text/Accent-text
    textAlt: "#2f2f2f", // Figma: Text/Alt-text
    textInverse: "#3b3a6d",
    shadowOpacity: 5.0,
  },
  buttons: {
    primary: {
      default: { surface: "#ff6b6b", text: "#fdfdfd" }, // Figma: Coral surface, white text
      hover: { surface: "#f83b3b", text: "#fdfdfd" }, // derived — Coral ramp
      pressed: { surface: "#e51d1d", text: "#fdfdfd" }, // derived — Coral ramp
      muted: { surface: "#ffe1e1", text: "#fdfdfd" }, // Figma: light pink, white text
    },
    secondary: {
      default: { surface: "#f83b3b", text: "#121212" }, // derived surface, Figma text (charcoal)
      hover: { surface: "#e4b363", text: "#121212" }, // Figma: GoldenSand hover, charcoal text
      pressed: { surface: "#e51d1d", text: "#121212" }, // derived
      muted: { surface: "#ffc7c7", text: "#121212" }, // derived
    },
    alt: {
      default: { text: "#ff6b6b" }, // Figma: Button/Text/Alt-default
      hover: { text: "#f83b3b" }, // derived
      pressed: { text: "#e51d1d" }, // derived
      muted: { text: "#ffc7c7" }, // derived
    },
  },
};

const darkTheme: Theme = {
  colors: {
    surfacePrimary: "#121212", // Figma: Surfaces/Primary
    surfaceSecondary: "#2f2f2f", // Figma: Surfaces/Secondary
    surfaceAccent: "#e4b363", // Figma: Surfaces/Accent (GoldenSand)
    surfaceWarm: "#414141", // derived — no Figma value observed in Dark frames
    surfaceElevated: "#161616",
    border: "#656565", // Figma: Surfaces/Borders
    textPrimary: "#fdfdfd", // Figma: Text/Primary-text
    textSecondary: "#d1d8e0", // Figma: Text/Secondary-text
    textMuted: "#656565", // Figma: Text/Muted-text
    textAccent: "#e4b363", // Figma: Text/Accent-text (GoldenSand)
    textAlt: "#f7f3e3", // Figma: Text/Alt-text (Warm Ivory)
    textInverse: "#3b3a6d",
    shadowOpacity: 10.0,
  },
  buttons: {
    primary: {
      default: { surface: "#6662c9", text: "#fdfdfd" }, // Figma: lighter indigo
      hover: { surface: "#5752b0", text: "#fdfdfd" }, // derived — DeepIndigo 700
      pressed: { surface: "#48448f", text: "#fdfdfd" }, // derived — DeepIndigo 800
      muted: { surface: "#d1d9f4", text: "#fdfdfd" }, // Figma: pale indigo
    },
    secondary: {
      default: { surface: "#f83b3b", text: "#121212" }, // derived surface, Figma text
      hover: { surface: "#e4b363", text: "#121212" }, // Figma: GoldenSand hover
      pressed: { surface: "#e51d1d", text: "#121212" }, // derived
      muted: { surface: "#ffc7c7", text: "#121212" }, // derived
    },
    alt: {
      default: { text: "#e4b363" }, // Figma: Button/Text/Alt-default (GoldenSand)
      hover: { text: "#ff6b6b" }, // derived
      pressed: { text: "#e51d1d" }, // derived
      muted: { text: "#ffc7c7" }, // derived
    },
  },
};

export const themes: Record<ThemeMode, Theme> = {
  light: lightTheme,
  flip: flipTheme,
  dark: darkTheme,
};
