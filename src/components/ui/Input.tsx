import { forwardRef, useState } from "react";
import {
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

export interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  helperText?: string;
  errorText?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, helperText, errorText, containerStyle, onFocus, onBlur, ...rest },
  ref,
) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = errorText
    ? palette.error
    : focused
      ? palette.brandPrimaryLight
      : colors.border;

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
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textMuted}
        style={{
          ...typography.bodyLg,
          height: 48,
          paddingHorizontal: spacing.s4,
          borderWidth: focused ? 2 : 1,
          borderColor,
          borderRadius: radius.sm,
          color: colors.textPrimary,
          backgroundColor: colors.surfacePrimary,
        }}
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
      {errorText ? (
        <Text style={{ ...typography.bodySm, color: palette.error }}>{errorText}</Text>
      ) : helperText ? (
        <Text style={{ ...typography.bodySm, color: colors.textMuted }}>{helperText}</Text>
      ) : null}
    </View>
  );
});
