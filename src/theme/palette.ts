// Brand-constant tokens — identical in all theme modes.
// Surface and text tokens live in `themes.ts` and resolve per mode.
export const palette = {
  // Brand identity
  brandPrimary: "#3b3a6d",
  brandPrimaryHover: "#48448f",
  brandPrimaryPressed: "#252442",
  brandPrimaryLight: "#5752b0",
  brandPrimaryMuted: "#b4bfed",

  accent: "#ff6b6b",
  accentStrong: "#f83b3b",
  accentPressed: "#e51d1d",
  accentMuted: "#ffc7c7",

  highlight: "#e4b363",
  accentDeep: "#5d3a5a",
  surfaceWarm: "#f7f3e3",
  charcoal: "#121212",

  // Brand-constant text colors used on top of brand surfaces (Primary /
  // Secondary buttons, Author badge, etc.). Always white-ish regardless of mode.
  textOnBrand: "#fdfdfd",

  // Semantic (constant across modes)
  success: "#3CAA6E",
  warning: "#e4b363",
  error: "#e51d1d",
  info: "#5752b0",

  // Neutrals (full ramp)
  gray1: "#EFEFEF",
  gray2: "#D9D9D9",
  gray3: "#C4C4C4",
  gray4: "#AEAEAE",
  gray5: "#989898",
  gray6: "#828282",
  gray7: "#6D6D6D",
  gray8: "#575757",
  gray9: "#414141",
  gray10: "#2B2B2B",
  gray11: "#161616",
  gray12: "#000000",
} as const;

export type PaletteToken = keyof typeof palette;
