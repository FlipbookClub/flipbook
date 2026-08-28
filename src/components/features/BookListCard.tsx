import { Image, Pressable, StyleSheet, Text, View } from "react-native";
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
   * Genres, rendered as one muted line under the author/page-count row.
   * Resolve with `bookGenres(book)` so legacy rows that only carry the single
   * `genre` field still render.
   */
  genres?: string[];
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
  genres,
  surface = "secondary",
}: Props) {
  const { colors } = useTheme();
  const initial = title.trim().slice(0, 1).toUpperCase() || "?";
  const onPrimary = surface === "primary";
  // Keep the progress track visible against whichever card surface is in use.
  const trackColor = onPrimary ? colors.surfaceSecondary : colors.surfacePrimary;
  return (
    // The whole card opens the book. It used to be only the 56x80 cover
    // thumbnail, which is a small target next to a card-sized affordance that
    // looks tappable — taps on the title or progress bar simply did nothing.
    // The options button below is nested and still takes its own taps.
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Open ${title}`}
      style={{
        flexDirection: "row",
        gap: spacing.s3,
        padding: spacing.s3,
        borderRadius: radius.sm,
        backgroundColor: onPrimary ? colors.surfacePrimary : colors.surfaceSecondary,
      }}
    >
      <View
        style={{
          // 72 rather than the original 56: once the frame stretches to the
          // card's height, a 56-wide strip is far off book proportions and
          // resizeMode="cover" crops the artwork's sides hard.
          width: 72,
          // Fills the card's height instead of sitting at a fixed 80 and
          // floating in the middle of a much taller column. The row's height is
          // still set by the text beside it, so the cover follows the card
          // rather than driving it. minHeight keeps the old floor so a sparse
          // card (no subtitle, no progress) does not end up with a squat cover.
          alignSelf: "stretch",
          minHeight: 80,
          borderRadius: radius.sm,
          overflow: "hidden",
          backgroundColor: palette.brandPrimary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {coverUrl ? (
          // Absolutely positioned so the artwork contributes nothing to layout.
          // As a normal child with height: "100%" it had no definite parent
          // height to resolve against once the frame started stretching, so it
          // fell back to the image's intrinsic pixel height and dragged the
          // whole card to the size of the cover file.
          <Image source={{ uri: coverUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <Text style={{ fontFamily: "Raleway-Bold", fontSize: 22, color: palette.textOnBrand }}>
            {initial}
          </Text>
        )}
      </View>

      <View style={{ flex: 1, gap: spacing.s2, justifyContent: "center" }}>
        <Text style={{ ...typography.overlineLg, color: colors.textAlt }} numberOfLines={2}>
          {title}
        </Text>
        <View style={{ flexDirection: "row", gap: spacing.s2, alignItems: "center" }}>
          {/* Books with a list of authors ("Marco Suarez, Jina Anne, Katie
              Sylor-Miller, ...") overflow the card: numberOfLines alone only
              caps the line count, it does not make the run give up width, so
              the author took its intrinsic size and shoved the page count off
              the right edge. flexShrink lets it yield and ellipsise instead.
              The page count refuses to shrink so it stays whole. */}
          <Text
            style={{ ...typography.bodySm, color: colors.textAccent, flexShrink: 1 }}
            numberOfLines={1}
          >
            {author}
          </Text>
          <Text style={{ ...typography.bodySm, color: colors.textMuted, flexShrink: 0 }}>
            {pageCount} pages
          </Text>
        </View>

        {genres && genres.length > 0 ? (
          // Plain muted text on its own line, not chips: this is metadata and
          // must not read as an action or compete with the title. Separated by
          // a middot rather than commas because most of the catalogue is
          // multi-word ("Biography & Memoir"), which commas run together.
          // Held to a single line so the card gains one row, never two.
          <Text style={{ ...typography.bodySm, color: colors.textMuted }} numberOfLines={1}>
            {genres.join(" · ")}
          </Text>
        ) : null}

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
    </Pressable>
  );
}
