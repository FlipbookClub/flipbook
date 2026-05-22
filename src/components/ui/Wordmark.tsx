import { useTheme } from "@/theme/ThemeContext";
import FullLightColored from "../../../assets/images/Logo/full-light-colored.svg";
import FullFlipColored from "../../../assets/images/Logo/full-flip-colored.svg";
import FullDarkColored from "../../../assets/images/Logo/full-dark-colored.svg";

// Brand wordmark — Figma-exported SVGs in `assets/images/Logo/`.
// Mode-aware: each theme mode gets its own colored variant of `Type=Full`.
// Source SVGs render natively via react-native-svg-transformer (see metro.config.js).
//
// Native aspect ratio is 175:42 (≈4.16). The `size` prop drives the *height*;
// width scales proportionally. Default 32 height ≈ 134 wide.
interface WordmarkProps {
  size?: number;
}

const NATIVE_W = 175;
const NATIVE_H = 42;

export function Wordmark({ size = 32 }: WordmarkProps) {
  const { mode } = useTheme();
  const Logo =
    mode === "flip" ? FullFlipColored : mode === "dark" ? FullDarkColored : FullLightColored;
  const width = Math.round((NATIVE_W / NATIVE_H) * size);
  return <Logo width={width} height={size} />;
}
