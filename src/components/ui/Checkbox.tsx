import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Check } from "lucide-react-native";

import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}

// Square checkbox + label row. Used in CreateCommunity permissions.
export function Checkbox({ label, checked, onChange, disabled }: CheckboxProps) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={() => onChange(!checked)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.s3,
        paddingVertical: spacing.s1,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: radius.sm / 2,
          borderWidth: 1.5,
          borderColor: checked ? palette.brandPrimary : colors.border,
          backgroundColor: checked
            ? palette.brandPrimary
            : pressed
              ? colors.surfaceSecondary
              : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked ? <Check size={14} color={palette.textOnBrand} strokeWidth={3} /> : null}
      </View>
      <Text style={{ ...typography.bodyMd, color: colors.textPrimary, flex: 1 }}>{label}</Text>
    </Pressable>
  );
}
