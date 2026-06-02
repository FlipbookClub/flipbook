import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

export interface EmptyStateProps {
  /** Optional icon rendered above the title (e.g. a lucide glyph). */
  icon?: ReactNode;
  title: string;
  description?: string;
  /** Optional CTA (Button) rendered below the copy. */
  action?: ReactNode;
  /** Tighter padding for inline/in-card use. */
  compact?: boolean;
}

// Shared empty-state block — dashed, theme-aware, centered. One component so
// every "nothing here yet" moment reads consistently across the app.
export function EmptyState({ icon, title, description, action, compact }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        alignItems: "center",
        gap: spacing.s2,
        paddingVertical: compact ? spacing.s4 : spacing.s6,
        paddingHorizontal: spacing.s4,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: "dashed",
      }}
    >
      {icon ? <View style={{ marginBottom: spacing.s1 }}>{icon}</View> : null}
      <Text
        style={{
          ...typography.bodyLg,
          fontFamily: "Raleway-SemiBold",
          color: colors.textPrimary,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      {description ? (
        <Text style={{ ...typography.bodySm, color: colors.textMuted, textAlign: "center" }}>
          {description}
        </Text>
      ) : null}
      {action ? <View style={{ marginTop: spacing.s2 }}>{action}</View> : null}
    </View>
  );
}
