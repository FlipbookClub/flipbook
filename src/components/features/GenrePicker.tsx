import { ScrollView, Pressable, Text } from "react-native";

import { GENRES, MAX_BOOK_GENRES } from "@/lib/genres";
import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

interface Props {
  /** Currently-selected genres, in catalogue order. */
  value: string[];
  /** Receives the new selection. Tapping a selected chip removes it. */
  onChange: (genres: string[]) => void;
  disabled?: boolean;
}

// Multi-select genre chips for a book (up to MAX_BOOK_GENRES), drawn from the
// shared catalogue. Horizontally scrollable so it stays one row tall inside
// the upload sheet.
//
// Once the cap is reached, unselected chips go dim and non-tappable rather
// than silently swallowing the tap or bumping someone's earlier choice — the
// limit should be visible before you hit it, not a surprise afterwards.
export function GenrePicker({ value, onChange, disabled }: Props) {
  const { colors } = useTheme();
  const atCap = value.length >= MAX_BOOK_GENRES;

  const toggle = (genre: string) => {
    if (value.includes(genre)) {
      onChange(value.filter((g) => g !== genre));
      return;
    }
    if (atCap) return;
    // Keep catalogue order so the stored array is stable regardless of the
    // order the user happened to tap in.
    onChange(GENRES.filter((g) => g === genre || value.includes(g)));
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ gap: spacing.s2, paddingVertical: spacing.s1 }}
    >
      {GENRES.map((g) => {
        const selected = value.includes(g);
        const blocked = !selected && atCap;
        return (
          <Pressable
            key={g}
            disabled={disabled || blocked}
            onPress={() => toggle(g)}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled: disabled || blocked }}
            style={{
              paddingVertical: spacing.s2,
              paddingHorizontal: spacing.s3,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: selected ? palette.brandPrimary : colors.border,
              backgroundColor: selected ? palette.brandPrimary : "transparent",
              opacity: disabled ? 0.5 : blocked ? 0.35 : 1,
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
