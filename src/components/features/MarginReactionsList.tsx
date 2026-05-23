import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

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
}

// One bubble ≈ 36px + small avatar overlap + spacing.s3 (12px) gap. 56px
// per row is a safe round-up so 8 rows + a little breathing room fit
// inside maxHeight without clipping the last bubble's shadow.
const ROW_HEIGHT = 56;
const MAX_VISIBLE_EXPANDED = 8;
const EXPANDED_MAX_HEIGHT = ROW_HEIGHT * MAX_VISIBLE_EXPANDED;

// Collapsed by default: shows only the most recent reaction + a "+N" badge
// for the rest, keeping the reading surface uncluttered. Tap the badge to
// expand and see all reactions; tap anywhere outside the strip to collapse
// back. Founder UX call 2026-05-23 — five bubbles in the margin felt noisy.
export function MarginReactionsList({ reactions, onSelectReaction }: Props) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  if (reactions.length === 0) return null;

  // Most recent reaction sits at the top of the strip when collapsed —
  // listForPage returns ascending by createdAt, so the newest is at the
  // end of the array.
  const ordered = [...reactions].reverse();
  const headline = ordered[0];
  const overflow = ordered.length - 1;

  return (
    <>
      {expanded ? (
        // Invisible backdrop so a tap on the Pdf area (or any non-bubble
        // region) collapses the expanded list. Positioned at parent edges;
        // bubbles below render above it.
        <Pressable
          onPress={() => setExpanded(false)}
          accessibilityLabel="Collapse reactions"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.05)",
          }}
        />
      ) : null}

      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          right: spacing.s3,
          top: spacing.s5,
          width: 48,
          alignItems: "center",
        }}
      >
        {expanded ? (
          <ScrollView
            style={{ maxHeight: EXPANDED_MAX_HEIGHT, width: 48 }}
            contentContainerStyle={{ alignItems: "center", gap: spacing.s3, paddingVertical: 4 }}
            showsVerticalScrollIndicator={ordered.length > MAX_VISIBLE_EXPANDED}
          >
            {ordered.map((r) => (
              <ReactionBubble
                key={r._id}
                emoji={r.emoji}
                isComment={r.type === "comment"}
                user={{ displayName: r.user.displayName, avatarUrl: r.user.avatarUrl }}
                onPress={() => {
                  setExpanded(false);
                  onSelectReaction(r._id);
                }}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={{ alignItems: "center", gap: spacing.s3 }}>
            <ReactionBubble
              key={headline._id}
              emoji={headline.emoji}
              isComment={headline.type === "comment"}
              user={{
                displayName: headline.user.displayName,
                avatarUrl: headline.user.avatarUrl,
              }}
              onPress={() => onSelectReaction(headline._id)}
            />
            {overflow > 0 ? (
              <Pressable
                onPress={() => setExpanded(true)}
                accessibilityRole="button"
                accessibilityLabel={`Show ${overflow} more reactions`}
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
              </Pressable>
            ) : null}
          </View>
        )}
      </View>
    </>
  );
}
