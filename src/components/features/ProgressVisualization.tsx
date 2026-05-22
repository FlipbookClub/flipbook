import { useMemo } from "react";
import { View, Text } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

interface MemberProgress {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  currentPage: number;
  totalPages: number;
}

interface Props {
  rows: MemberProgress[] | undefined;
  bookTitle?: string;
}

// Soft, non-anxious visualization (PRD § UI/UX > Club Detail) — avatars sit
// along a horizontal bar at their fraction-of-book read. The median marker is
// a quiet vertical line, not a leaderboard. No "you're behind" copy.
const BAR_HEIGHT = 8;
const AVATAR_SIZE = 24;
const TRACK_PADDING = AVATAR_SIZE / 2;

export function ProgressVisualization({ rows, bookTitle }: Props) {
  const { colors } = useTheme();

  const points = useMemo(() => {
    if (!rows) return [];
    return rows
      .filter((r) => r.totalPages > 0)
      .map((r) => ({
        ...r,
        fraction: Math.max(0, Math.min(1, r.currentPage / r.totalPages)),
      }));
  }, [rows]);

  const median = useMemo(() => {
    if (points.length === 0) return null;
    const sorted = [...points].map((p) => p.fraction).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }, [points]);

  if (!rows) {
    return null;
  }

  if (points.length === 0) {
    return (
      <View
        style={{
          padding: spacing.s4,
          borderRadius: radius.md,
          backgroundColor: colors.surfaceSecondary,
        }}
      >
        <Text style={{ ...typography.bodySm, color: colors.textMuted, textAlign: "center" }}>
          {bookTitle
            ? `No reading progress yet for "${bookTitle}". Be the first to start.`
            : "No reading progress yet."}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.s2 }}>
      {bookTitle ? (
        <Text style={{ ...typography.uiLabelMd, color: colors.textMuted }}>
          Where everyone is in {bookTitle}
        </Text>
      ) : null}
      <View
        style={{
          paddingHorizontal: TRACK_PADDING,
          paddingVertical: spacing.s3,
        }}
      >
        <View
          style={{
            height: AVATAR_SIZE + spacing.s2,
            position: "relative",
            justifyContent: "center",
          }}
        >
          {/* Track */}
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: BAR_HEIGHT,
              borderRadius: BAR_HEIGHT / 2,
              backgroundColor: colors.surfaceSecondary,
            }}
          />
          {/* Median marker */}
          {median !== null ? (
            <View
              style={{
                position: "absolute",
                left: `${median * 100}%`,
                top: 0,
                bottom: 0,
                width: 2,
                marginLeft: -1,
                backgroundColor: palette.brandPrimaryLight,
                opacity: 0.5,
              }}
              accessibilityLabel="Club median"
            />
          ) : null}
          {/* Member dots */}
          {points.map((p) => (
            <View
              key={p.userId}
              style={{
                position: "absolute",
                left: `${p.fraction * 100}%`,
                marginLeft: -(AVATAR_SIZE / 2),
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_SIZE / 2,
                borderWidth: 2,
                borderColor: colors.surfacePrimary,
              }}
            >
              <Avatar name={p.displayName} imageUri={p.avatarUrl} size="sm" />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
