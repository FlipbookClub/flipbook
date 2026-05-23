import { Text, View } from "react-native";

import { ReactionBubble } from "@/components/features/ReactionBubble";
import { spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { Id } from "../../../convex/_generated/dataModel";

export interface MarginReaction {
  _id: Id<"reactions">;
  type: "emoji" | "comment";
  emoji?: string;
  user: {
    _id: Id<"users">;
    displayName: string;
    avatarUrl?: string;
  };
}

interface Props {
  reactions: MarginReaction[];
  onSelectReaction: (reactionId: Id<"reactions">) => void;
  // Visible cap; anything beyond becomes a "+N" badge that opens the full
  // list. Per FR-016 the margin shows up to 5.
  visibleCap?: number;
}

const DEFAULT_CAP = 5;

export function MarginReactionsList({
  reactions,
  onSelectReaction,
  visibleCap = DEFAULT_CAP,
}: Props) {
  const { colors } = useTheme();
  if (reactions.length === 0) return null;

  const visible = reactions.slice(0, visibleCap);
  const overflow = reactions.length - visible.length;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        right: spacing.s3,
        top: spacing.s5,
        bottom: spacing.s5,
        width: 48,
        alignItems: "center",
        gap: spacing.s3,
      }}
    >
      {visible.map((r) => (
        <ReactionBubble
          key={r._id}
          emoji={r.emoji}
          isComment={r.type === "comment"}
          user={{ displayName: r.user.displayName, avatarUrl: r.user.avatarUrl }}
          onPress={() => onSelectReaction(r._id)}
        />
      ))}
      {overflow > 0 ? (
        <View
          style={{
            paddingVertical: 4,
            paddingHorizontal: spacing.s2,
            borderRadius: 12,
            backgroundColor: colors.surfacePrimary,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ ...typography.uiLabelMd, color: colors.textMuted }}>
            +{overflow}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
