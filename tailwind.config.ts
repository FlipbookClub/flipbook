import type { Config } from "tailwindcss";

export default {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "brand-primary": "#3b3a6d",
        "brand-primary-hover": "#48448f",
        "brand-primary-pressed": "#252442",
        "brand-primary-light": "#5752b0",
        "brand-primary-muted": "#b4bfed",

        accent: "#ff6b6b",
        "accent-strong": "#f83b3b",
        "accent-pressed": "#e51d1d",
        "accent-muted": "#ffc7c7",

        highlight: "#e4b363",
        "accent-deep": "#5d3a5a",
        "surface-warm": "#f7f3e3",

        "surface-primary": "#fdfdfd",
        "surface-secondary": "#f1f4fc",
        border: "#b4bfed",
        "bg-dark": "#121212",

        "text-primary": "#3b3a6d",
        "text-secondary": "#464646",
        "text-muted": "#989898",
        "text-accent": "#5d3a5a",
        "text-alt": "#2f2f2f",
        "text-inverse": "#fdfdfd",

        success: "#3CAA6E",
        warning: "#e4b363",
        error: "#e51d1d",
        info: "#5752b0",
      },
      fontFamily: {
        "raleway-medium": ["Raleway-Medium"],
        "raleway-semibold": ["Raleway-SemiBold"],
        "raleway-bold": ["Raleway-Bold"],
        "inter-regular": ["Inter-Regular"],
        "inter-medium": ["Inter-Medium"],
        "inter-semibold": ["Inter-SemiBold"],
      },
      spacing: {
        s1: "4px",
        s2: "8px",
        s3: "12px",
        s4: "16px",
        s5: "24px",
        s6: "32px",
        s7: "48px",
        s8: "64px",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
    },
  },
} satisfies Config;
