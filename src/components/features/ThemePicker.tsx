import { Pressable, Text, View } from "react-native";

import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { themes, type ThemeMode } from "@/theme/themes";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

// FR-087b / TASK-087b: three side-by-side preview swatches showing the
// active mode and the two others as mini mockups (surface + sample button).
// Tapping a swatch flips the global theme. Selected mode gets a 2px Coral
// border (brand accent).
const MODES: Array<{ mode: ThemeMode; label: string }> = [
  { mode: "light", label: "Light" },
  { mode: "flip", label: "Flip" },
  { mode: "dark", label: "Dark" },
];

export function ThemePicker() {
  const { mode, setMode, colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        gap: spacing.s3,
        paddingVertical: spacing.s3,
        paddingHorizontal: spacing.s4,
      }}
    >
      {MODES.map(({ mode: m, label }) => {
        const swatch = themes[m].colors;
        const selected = mode === m;
        return (
          <Pressable
            key={m}
            onPress={() => setMode(m)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${label} theme${selected ? ", selected" : ""}`}
            style={{
              flex: 1,
              gap: spacing.s1,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: "100%",
                aspectRatio: 1,
                borderRadius: radius.md,
                backgroundColor: swatch.surfacePrimary,
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? palette.accent : colors.border,
                padding: spacing.s2,
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  width: "70%",
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: swatch.textPrimary,
                  opacity: 0.8,
                }}
              />
              <View
                style={{
                  width: "90%",
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: swatch.textMuted,
                  opacity: 0.6,
                }}
              />
              <View
                style={{
                  height: 18,
                  borderRadius: 4,
                  backgroundColor: palette.brandPrimary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    ...typography.uiLabelMd,
                    fontFamily: "Raleway-SemiBold",
                    color: palette.textOnBrand,
                    fontSize: 10,
                  }}
                >
                  React
                </Text>
              </View>
            </View>
            <Text
              style={{
                ...typography.bodySm,
                color: selected ? colors.textPrimary : colors.textMuted,
                fontFamily: selected ? "Raleway-SemiBold" : "Inter-Regular",
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
