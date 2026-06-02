import { useState } from "react";
import {
  Pressable,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

export type ButtonVariant = "primary" | "secondary" | "alt";
export type ButtonSize = "sm" | "md" | "lg";

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

// Avoid Pressable's `style={(state) => ...}` callback form — under
// react-native-reanimated 4 it silently swallows returned styles in some
// configurations (observed empirically: background color and other layout
// props don't apply). Tracking pressed state manually keeps the same UX.
export function Button({
  label,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  style,
  onPressIn,
  onPressOut,
  ...rest
}: ButtonProps) {
  const { buttons } = useTheme();
  const sizeTokens = SIZE_TOKENS[size];
  const [pressed, setPressed] = useState(false);

  const baseSurface =
    variant === "alt"
      ? "transparent"
      : disabled
        ? buttons[variant].muted.surface
        : pressed
          ? buttons[variant].pressed.surface
          : buttons[variant].default.surface;

  const textColor =
    variant === "alt"
      ? disabled
        ? buttons.alt.muted.text
        : pressed
          ? buttons.alt.pressed.text
          : buttons.alt.default.text
      : disabled
        ? buttons[variant].muted.text
        : pressed
          ? buttons[variant].pressed.text
          : buttons[variant].default.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPressIn={(event) => {
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        onPressOut?.(event);
      }}
      style={[
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
      ]}
      {...rest}
    >
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
    </Pressable>
  );
}
