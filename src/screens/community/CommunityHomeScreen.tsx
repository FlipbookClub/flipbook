import { SafeAreaView, ScrollView, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

// Placeholder Community Home screen for TASK-009 nav scaffold.
// Real implementation in TASK-026 (Figma node 107:13519).
export function CommunityHomeScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfaceSecondary }}>
      <ScrollView contentContainerStyle={{ padding: spacing.s5, gap: spacing.s4 }}>
        <Text style={{ ...typography.headingLg, color: colors.textPrimary }}>
          Community
        </Text>
        <Text style={{ ...typography.bodyMd, color: colors.textSecondary }}>
          Discovery + your clubs land here in TASK-026.
        </Text>
        <Card>
          <View style={{ gap: spacing.s2 }}>
            <Tag label="Placeholder" />
            <Text style={{ ...typography.bodyMd, color: colors.textPrimary }}>
              No clubs yet — this scaffold proves the theme + nav stack works.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
