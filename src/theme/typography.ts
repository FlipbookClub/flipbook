export const fontFamilies = {
  primary: "Raleway",
  secondary: "Inter",
} as const;

export const typography = {
  // Display
  displayLg: {
    fontFamily: "Raleway-Bold",
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: 0,
  },
  displayMd: {
    fontFamily: "Raleway-Bold",
    fontSize: 26,
    lineHeight: 31,
    letterSpacing: 0,
  },
  // Headings
  headingLg: {
    fontFamily: "Raleway-SemiBold",
    fontSize: 22,
    lineHeight: 29,
    letterSpacing: 0,
  },
  headingMd: {
    fontFamily: "Raleway-SemiBold",
    fontSize: 18,
    lineHeight: 23,
    letterSpacing: 0,
  },
  // Body
  bodyLg: {
    fontFamily: "Raleway-Medium",
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: 0,
  },
  bodyMd: {
    fontFamily: "Raleway-Medium",
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0,
  },
  bodySm: {
    fontFamily: "Raleway-Medium",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  bodyCaption: {
    fontFamily: "Raleway-Medium",
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0,
  },
  // Paragraphs (longer-form copy)
  paragraphMd: {
    fontFamily: "Raleway-Medium",
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  paragraphSm: {
    fontFamily: "Raleway-Medium",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  paragraphXs: {
    fontFamily: "Raleway-Medium",
    fontSize: 12,
    lineHeight: 20,
    letterSpacing: 0,
  },
  // UI labels
  uiLabelMd: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  uiLabelRg: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  overlineLg: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    lineHeight: 18,
    // Figma "letterSpacing: 4" is a percentage (4% of 14px = 0.56px); RN takes
    // px, so 4 here rendered far too wide. 0.56px matches the design.
    letterSpacing: 0.56,
    textTransform: "uppercase" as const,
  },
} as const;

export type TypographyToken = keyof typeof typography;
