import {
  Pressable,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

export type ButtonVariant = "primary" | "secondary" | "alt";
export type ButtonSize = "sm" | "md" | "lg";

interface VariantSurfaces {
  default: string;
  hover: string;
  pressed: string;
  muted: string;
}

interface AltTextColors {
  default: string;
  pressed: string;
  muted: string;
}

const SURFACES: Record<Exclude<ButtonVariant, "alt">, VariantSurfaces> = {
  primary: {
    default: palette.brandPrimary,
    hover: palette.brandPrimaryHover,
    pressed: palette.brandPrimaryPressed,
    muted: palette.brandPrimaryMuted,
  },
  secondary: {
    default: palette.accentStrong,
    hover: palette.accent,
    pressed: palette.accentPressed,
    muted: palette.accentMuted,
  },
};

const ALT_TEXT: AltTextColors = {
  default: palette.accentStrong,
  pressed: palette.accentPressed,
  muted: palette.accentMuted,
};

const SIZE_TOKENS: Record<ButtonSize, { height: number; padH: number; fontSize: number }> = {
  sm: { height: 36, padH: spacing.s3, fontSize: 14 },
  md: { height: 44, padH: spacing.s4, fontSize: 15 },
  lg: { height: 52, padH: spacing.s5, fontSize: 16 },
};

export interface ButtonProps extends Omit<PressableProps, "style" | "children"> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  style,
  ...rest
}: ButtonProps) {
  const sizeTokens = SIZE_TOKENS[size];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={({ pressed }) => {
        const baseSurface =
          variant === "alt"
            ? "transparent"
            : disabled
              ? SURFACES[variant].muted
              : pressed
                ? SURFACES[variant].pressed
                : SURFACES[variant].default;

        return [
          {
            height: sizeTokens.height,
            paddingHorizontal: sizeTokens.padH,
            borderRadius: radius.md,
            backgroundColor: baseSurface,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            opacity: variant === "alt" && disabled ? 0.5 : 1,
            alignSelf: fullWidth ? "stretch" : "flex-start",
          },
          style,
        ];
      }}
      {...rest}
    >
      {({ pressed }) => {
        const textColor =
          variant === "alt"
            ? disabled
              ? ALT_TEXT.muted
              : pressed
                ? ALT_TEXT.pressed
                : ALT_TEXT.default
            : palette.textOnBrand;

        return (
          <>
            {leadingIcon ? <View style={{ marginRight: spacing.s2 }}>{leadingIcon}</View> : null}
            <Text
              style={{
                ...typography.bodyLg,
                fontFamily: "Raleway-SemiBold",
                fontSize: sizeTokens.fontSize,
                color: textColor,
              }}
            >
              {label}
            </Text>
            {trailingIcon ? <View style={{ marginLeft: spacing.s2 }}>{trailingIcon}</View> : null}
          </>
        );
      }}
    </Pressable>
  );
}
