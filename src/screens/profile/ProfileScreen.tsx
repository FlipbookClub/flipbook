import { SafeAreaView, Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

// Placeholder Profile screen — real implementation in TASK-022.
export function ProfileScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfaceSecondary }}>
      <View style={{ padding: spacing.s5, gap: spacing.s4, alignItems: "center" }}>
        <Avatar name="Moks" size="xl" />
        <Text style={{ ...typography.headingLg, color: colors.textPrimary }}>You</Text>
        <Text style={{ ...typography.bodyMd, color: colors.textSecondary, textAlign: "center" }}>
          Profile + Settings land in TASK-022 / TASK-087b.
        </Text>
      </View>
    </SafeAreaView>
  );
}
