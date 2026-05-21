import { Text, View, type StyleProp, type ViewStyle } from "react-native";

import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

export type TagVariant = "filled" | "outlined";

export interface TagProps {
  label: string;
  variant?: TagVariant;
  style?: StyleProp<ViewStyle>;
}

export function Tag({ label, variant = "filled", style }: TagProps) {
  const { colors } = useTheme();

  const surface =
    variant === "filled"
      ? { backgroundColor: palette.brandPrimaryMuted, borderWidth: 0 }
      : {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.border,
        };

  const textColor = variant === "filled" ? palette.brandPrimary : colors.textPrimary;

  return (
    <View
      style={[
        {
          alignSelf: "flex-start",
          paddingVertical: spacing.s1,
          paddingHorizontal: spacing.s3,
          borderRadius: radius.pill,
        },
        surface,
        style,
      ]}
    >
      <Text style={{ ...typography.uiLabelMd, color: textColor }}>{label}</Text>
    </View>
  );
}
