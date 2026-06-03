import { Image, Pressable, Text, View } from "react-native";
import { MoreVertical } from "@/lib/icons";

import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

interface Props {
  title: string;
  author: string;
  pageCount: number;
  coverUrl?: string;
  onOpen: () => void;
  /** Renders the ⋮ options affordance when provided. */
  onOptions?: () => void;
  /** Optional muted line under the author/pages (e.g. the club name). */
  subtitle?: string;
  /** Optional "Started <date>" line. */
  started?: string;
  /** Optional progress bar + label. */
  progress?: { label: string; pct: number };
  /**
   * Card background. "secondary" (default) is the filled card; "primary" keeps
   * the screen background so the card sits flat — used for de-emphasized rows
   * like the club's "Past reads".
   */
  surface?: "primary" | "secondary";
}

// The book card used across the club lobby (Room + Library tabs) and the user's
// Library screen. A surfaceSecondary card with a cover-only thumbnail, an
// uppercase title (textAlt), accent author + muted page count, and optional
// subtitle / started date / progress bar. Text colors stay mode-correct on the
// secondary surface. Figma "Frame 3910".
export function BookListCard({
  title,
  author,
  pageCount,
  coverUrl,
  onOpen,
  onOptions,
  subtitle,
  started,
  progress,
  surface = "secondary",
}: Props) {
  const { colors } = useTheme();
  const initial = title.trim().slice(0, 1).toUpperCase() || "?";
  const onPrimary = surface === "primary";
  // Keep the progress track visible against whichever card surface is in use.
  const trackColor = onPrimary ? colors.surfaceSecondary : colors.surfacePrimary;
  return (
    <View
      style={{
        flexDirection: "row",
        gap: spacing.s3,
        padding: spacing.s3,
        borderRadius: radius.sm,
        backgroundColor: onPrimary ? colors.surfacePrimary : colors.surfaceSecondary,
      }}
    >
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`Open ${title}`}
        style={{
          width: 56,
          height: 80,
          borderRadius: radius.sm,
          overflow: "hidden",
          backgroundColor: palette.brandPrimary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <Text style={{ fontFamily: "Raleway-Bold", fontSize: 22, color: palette.textOnBrand }}>
            {initial}
          </Text>
        )}
      </Pressable>

      <View style={{ flex: 1, gap: spacing.s2, justifyContent: "center" }}>
        <Text style={{ ...typography.overlineLg, color: colors.textAlt }} numberOfLines={2}>
          {title}
        </Text>
        <View style={{ flexDirection: "row", gap: spacing.s2, alignItems: "center" }}>
          <Text style={{ ...typography.bodySm, color: colors.textAccent }} numberOfLines={1}>
            {author}
          </Text>
          <Text style={{ ...typography.bodySm, color: colors.textMuted }}>{pageCount} pages</Text>
        </View>

        {subtitle ? (
          <Text style={{ ...typography.bodySm, color: colors.textMuted }} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}

        {started ? (
          <Text style={{ ...typography.bodySm, color: colors.textMuted }}>
            Started <Text style={{ color: colors.textAccent }}>{started}</Text>
          </Text>
        ) : null}

        {progress ? (
          <View style={{ flexDirection: "row", gap: spacing.s2, alignItems: "center" }}>
            <View
              style={{ flex: 1, height: 6, borderRadius: radius.sm, backgroundColor: trackColor }}
            >
              <View
                style={{
                  width: `${Math.min(100, Math.max(0, progress.pct))}%`,
                  height: 6,
                  borderRadius: radius.sm,
                  backgroundColor: colors.surfaceAccent,
                }}
              />
            </View>
            <Text style={{ ...typography.bodySm, color: colors.textSecondary }}>
              {progress.label} <Text style={{ color: colors.textAccent }}>{progress.pct}%</Text>
            </Text>
          </View>
        ) : null}
      </View>

      {onOptions ? (
        <Pressable
          onPress={onOptions}
          hitSlop={spacing.s3}
          accessibilityRole="button"
          accessibilityLabel={`Options for ${title}`}
          style={{ alignSelf: "flex-start", padding: spacing.s1 }}
        >
          <MoreVertical size={20} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}
