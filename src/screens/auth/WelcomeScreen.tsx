import { SafeAreaView, View } from "react-native";
import { Text } from "react-native";

import { Button } from "@/components/ui/Button";
import { spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

// Placeholder Welcome screen for TASK-009 nav scaffold. Full Figma-aligned
// implementation lands in TASK-016 (Sign-up & Onboarding section node 78:11951).
export function WelcomeScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: spacing.s5,
          gap: spacing.s4,
        }}
      >
        <Text style={{ ...typography.displayMd, color: colors.textPrimary, textAlign: "center" }}>
          Flipbook
        </Text>
        <Text
          style={{
            ...typography.bodyLg,
            color: colors.textSecondary,
            textAlign: "center",
          }}
        >
          Welcome screen placeholder — TASK-016 wires the real auth flow.
        </Text>
        <Button label="Continue" />
      </View>
    </SafeAreaView>
  );
}
