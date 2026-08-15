import { useState } from "react";
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
  // 0..1. When set, the button IS the progress bar: it stays on its normal
  // vivid surface (never the muted/disabled look) with a darker fill
  // growing left-to-right behind the label, and ignores taps regardless of
  // the `disabled` prop. Used for upload/long-running submit affordances.
  progress?: number;
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
  progress,
  onPressIn,
  onPressOut,
  ...rest
}: ButtonProps) {
  const { buttons } = useTheme();
  const sizeTokens = SIZE_TOKENS[size];
  const [pressed, setPressed] = useState(false);
  const inProgress = progress !== undefined;
  const isDisabled = disabled || inProgress;

  // While in progress, force the normal vivid surface/text — never the
  // muted disabled look, regardless of the (also-true) real disabled state.
  const baseSurface =
    variant === "alt"
      ? "transparent"
      : inProgress
        ? buttons[variant].default.surface
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
      : inProgress
        ? buttons[variant].default.text
        : disabled
          ? buttons[variant].muted.text
          : pressed
            ? buttons[variant].pressed.text
            : buttons[variant].default.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: inProgress }}
      accessibilityValue={inProgress ? { min: 0, max: 100, now: Math.round(progress * 100) } : undefined}
      disabled={isDisabled}
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
          overflow: inProgress ? "hidden" : undefined,
        },
        style,
      ]}
      {...rest}
    >
      {inProgress ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
            backgroundColor: palette.brandPrimaryPressed,
          }}
        />
      ) : null}
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
