import { Pressable, Text, View } from "react-native";

import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

interface Props {
  chapterNumber: number;
  title: string;
  publishedAt: number;
  pageCount: number;
  isUnread?: boolean;
  onPress: () => void;
}

function formatDate(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
}

export function ChapterListItem({
  chapterNumber,
  title,
  publishedAt,
  pageCount,
  isUnread,
  onPress,
}: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open chapter ${chapterNumber}`}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.s3,
        paddingVertical: spacing.s3,
        paddingHorizontal: spacing.s3,
        borderRadius: radius.md,
        backgroundColor: pressed ? colors.surfaceSecondary : "transparent",
      })}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: radius.md,
          backgroundColor: colors.surfaceSecondary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{ fontFamily: "Raleway-Bold", fontSize: 16, color: palette.brandPrimary }}
        >
          {chapterNumber}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            ...typography.bodyMd,
            color: colors.textPrimary,
            fontFamily: "Raleway-SemiBold",
          }}
          numberOfLines={2}
        >
          {title}
        </Text>
        <Text style={{ ...typography.uiLabelMd, color: colors.textMuted }}>
          {formatDate(publishedAt)} · {pageCount} {pageCount === 1 ? "page" : "pages"}
        </Text>
      </View>
      {isUnread ? (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: palette.accentStrong,
          }}
          accessibilityLabel="Unread"
        />
      ) : null}
    </Pressable>
  );
}
