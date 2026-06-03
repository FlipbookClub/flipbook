import { forwardRef, useState, type ReactNode } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { Eye, EyeOff } from "@/lib/icons";

import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

export type InputVariant = "boxed" | "underline";

export interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  helperText?: string;
  errorText?: string;
  variant?: InputVariant;
  containerStyle?: StyleProp<ViewStyle>;
  /** Decorative trailing icon (e.g. a search or lock glyph), right-aligned.
   *  Ignored for secure fields (those show the eye toggle instead). */
  rightIcon?: ReactNode;
}

const ACCESSORY_WIDTH = 36;

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    helperText,
    errorText,
    variant = "boxed",
    secureTextEntry,
    containerStyle,
    rightIcon,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [secureVisible, setSecureVisible] = useState(false);

  const accentColor = errorText
    ? palette.error
    : focused
      ? palette.brandPrimaryLight
      : colors.border;

  // When the field is a password, render an eye toggle on the right that flips
  // `secureTextEntry`. Keeps the underline (or border) extending under the icon
  // by reserving space via `paddingRight`.
  const showSecureToggle = secureTextEntry !== undefined;
  const effectiveSecure = secureTextEntry && !secureVisible;
  const ToggleIcon = secureVisible ? EyeOff : Eye;

  const baseStyle =
    variant === "underline"
      ? {
          ...typography.bodyLg,
          height: 40,
          paddingHorizontal: 0,
          paddingVertical: spacing.s2,
          borderBottomWidth: focused ? 2 : 1,
          borderBottomColor: accentColor,
          color: colors.textPrimary,
          backgroundColor: "transparent",
        }
      : {
          ...typography.bodyLg,
          height: 48,
          paddingHorizontal: spacing.s4,
          borderWidth: focused ? 2 : 1,
          borderColor: accentColor,
          borderRadius: radius.sm,
          color: colors.textPrimary,
          backgroundColor: colors.surfacePrimary,
        };

  const showAccessory = showSecureToggle || !!rightIcon;
  const inputStyle = showAccessory
    ? { ...baseStyle, paddingRight: ACCESSORY_WIDTH }
    : baseStyle;

  return (
    <View style={[{ gap: spacing.s2 }, containerStyle]}>
      {label ? (
        <Text
          style={{
            ...typography.uiLabelMd,
            color: colors.textSecondary,
          }}
        >
          {label}
        </Text>
      ) : null}
      <View style={{ position: "relative" }}>
        <TextInput
          ref={ref}
          // Many fields use only a placeholder (no visible label) — placeholders
          // aren't a reliable accessible name across screen readers, so derive
          // one from label → placeholder. A caller-supplied accessibilityLabel
          // in `rest` still wins (spread below).
          accessibilityLabel={label ?? rest.placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={effectiveSecure}
          style={inputStyle}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />
        {showSecureToggle ? (
          <Pressable
            onPress={() => setSecureVisible((v) => !v)}
            hitSlop={spacing.s2}
            accessibilityRole="button"
            accessibilityLabel={secureVisible ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: variant === "boxed" ? spacing.s3 : 0,
              top: 0,
              bottom: variant === "underline" ? 4 : 0,
              width: ACCESSORY_WIDTH,
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <ToggleIcon size={20} color={colors.textMuted} />
          </Pressable>
        ) : !showSecureToggle && rightIcon ? (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              right: variant === "boxed" ? spacing.s3 : 0,
              top: 0,
              bottom: variant === "underline" ? 4 : 0,
              width: ACCESSORY_WIDTH,
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            {rightIcon}
          </View>
        ) : null}
      </View>
      {errorText ? (
        <Text style={{ ...typography.bodySm, color: palette.error }}>{errorText}</Text>
      ) : helperText ? (
        <Text style={{ ...typography.bodySm, color: colors.textMuted }}>{helperText}</Text>
      ) : null}
    </View>
  );
});
