import { ScrollView, Pressable, Text } from "react-native";

import { GENRES } from "@/lib/genres";
import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

interface Props {
  /** The currently-selected genre, or null. */
  value: string | null;
  /** Tapping the selected chip again clears it (passes null). */
  onChange: (genre: string | null) => void;
  disabled?: boolean;
}

// Single-select genre chips for a book, drawn from the shared GENRES catalogue.
// Horizontally scrollable so it stays one row tall inside the upload sheet.
export function GenrePicker({ value, onChange, disabled }: Props) {
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ gap: spacing.s2, paddingVertical: spacing.s1 }}
    >
      {GENRES.map((g) => {
        const selected = value === g;
        return (
          <Pressable
            key={g}
            disabled={disabled}
            onPress={() => onChange(selected ? null : g)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={{
              paddingVertical: spacing.s2,
              paddingHorizontal: spacing.s3,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: selected ? palette.brandPrimary : colors.border,
              backgroundColor: selected ? palette.brandPrimary : "transparent",
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <Text
              style={{
                ...typography.uiLabelMd,
                color: selected ? palette.textOnBrand : colors.textPrimary,
              }}
            >
              {g}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
