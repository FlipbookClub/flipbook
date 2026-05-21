import { SafeAreaView, Text, View } from "react-native";

import { spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

// Placeholder Library screen — real implementation in TASK-042.
export function LibraryScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfaceSecondary }}>
      <View style={{ padding: spacing.s5, gap: spacing.s3 }}>
        <Text style={{ ...typography.headingLg, color: colors.textPrimary }}>Library</Text>
        <Text style={{ ...typography.bodyMd, color: colors.textSecondary }}>
          Your books across clubs (TASK-042).
        </Text>
      </View>
    </SafeAreaView>
  );
}
