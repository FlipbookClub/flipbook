import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { CheckCircle2 } from "lucide-react-native";

import { Avatar } from "@/components/ui/Avatar";
import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

export interface ClubCardData {
  name: string;
  description?: string;
  moderatorName?: string;
  memberCount: number;
  coverImageUrl?: string | null;
  isMember?: boolean;
  lastActivityAt?: number;
}

function formatActivity(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Active just now";
  if (minutes < 60) return `Active ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Active ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Active ${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `Active ${weeks}w ago`;
  return "Quiet for a while";
}

interface ClubCardProps {
  club: ClubCardData;
  onPress?: () => void;
  /** Render on a filled surfaceSecondary card (per Figma "my communities"). */
  contained?: boolean;
}

// Community card per Figma "Community link card": square emblem on the left,
// name + "Moderated by …" + member count on the right, optional Member badge.
// Stubbed avatar stack uses initials from the moderator name until we wire
// the member-avatars endpoint in Phase 4.
export function ClubCard({ club, onPress, contained }: ClubCardProps) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);

  const surface = contained
    ? colors.surfaceSecondary
    : pressed
      ? colors.surfaceSecondary
      : "transparent";

  const initials = club.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${club.name}`}
      style={{
        flexDirection: "row",
        gap: spacing.s3,
        padding: spacing.s3,
        borderRadius: radius.md,
        backgroundColor: surface,
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: radius.sm,
          overflow: "hidden",
          backgroundColor: colors.surfaceSecondary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {club.coverImageUrl ? (
          <Image
            source={{ uri: club.coverImageUrl }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <Text
            style={{
              fontFamily: "Raleway-Bold",
              fontSize: 22,
              color: palette.brandPrimary,
            }}
          >
            {initials || "?"}
          </Text>
        )}
      </View>

      <View style={{ flex: 1, gap: spacing.s1 }}>
        <Text
          style={{
            // Figma: community name is Body/Overline/Large (uppercase). textAlt
            // reads on the light contained card (Light/Flip) and the dark card
            // (Dark); textPrimary on the plain primary surface (popular list).
            ...typography.overlineLg,
            color: contained ? colors.textAlt : colors.textPrimary,
          }}
          numberOfLines={2}
        >
          {club.name}
        </Text>
        {club.moderatorName ? (
          <Text style={{ ...typography.bodySm, color: colors.textMuted }}>
            Moderated by:{" "}
            <Text style={{ color: colors.textAccent, fontFamily: "Raleway-SemiBold" }}>
              {club.moderatorName}
            </Text>
          </Text>
        ) : null}
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.s2 }}>
          <View style={{ flexDirection: "row" }}>
            {/* Placeholder avatar stack — wires to real member avatars later. */}
            <Avatar name="A B" size="sm" />
            <View style={{ marginLeft: -10 }}>
              <Avatar name="C D" size="sm" />
            </View>
            <View style={{ marginLeft: -10 }}>
              <Avatar name="E F" size="sm" />
            </View>
          </View>
          <Text style={{ ...typography.bodySm, color: colors.textMuted }}>
            {club.memberCount.toLocaleString()} members
          </Text>
        </View>
        {club.lastActivityAt ? (
          <Text style={{ ...typography.uiLabelMd, color: colors.textMuted }}>
            {formatActivity(club.lastActivityAt)}
          </Text>
        ) : null}
      </View>

      {club.isMember ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.s1,
            paddingVertical: spacing.s1,
            paddingHorizontal: spacing.s2,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: colors.textAccent,
          }}
        >
          <CheckCircle2 size={12} color={colors.textAccent} />
          <Text
            style={{
              ...typography.uiLabelMd,
              fontSize: 11,
              color: colors.textAccent,
              fontFamily: "Raleway-SemiBold",
            }}
          >
            Member
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
