import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { MessageSquare, Trash2, X } from "lucide-react-native";
import { useMutation, useQuery } from "convex/react";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ReactionComposer } from "@/screens/reader/ReactionComposer";
import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

interface Props {
  visible: boolean;
  reactionId: Id<"reactions"> | null;
  // The reader passes its current clubId/bookId/page so we can scope the
  // reply mutation correctly without re-deriving from the parent reaction.
  clubId: Id<"clubs">;
  bookId: Id<"books">;
  page: number;
  currentUserId: Id<"users"> | null;
  onClose: () => void;
}

function formatRelative(ts: number): string {
  const diffMs = Date.now() - ts;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export function ReactionDetailsSheet({
  visible,
  reactionId,
  clubId,
  bookId,
  page,
  currentUserId,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const createReaction = useMutation(api.reactions.create);
  const removeReaction = useMutation(api.reactions.remove);

  // The page query already returned the parent reaction object, but we
  // refetch by ID here so the sheet stays correct if reactions on the page
  // change while it's open. Skipping when not visible keeps the WS quiet.
  const replies = useQuery(
    api.reactions.listReplies,
    visible && reactionId ? { reactionId } : "skip",
  );
  const pageReactions = useQuery(
    api.reactions.listForPage,
    visible ? { clubId, bookId, page } : "skip",
  );
  const parent = pageReactions?.find((r) => r._id === reactionId) ?? null;

  const [replyOpen, setReplyOpen] = useState(false);

  const handleReplySubmit = async (payload: { type: "emoji" | "comment"; text?: string }) => {
    if (!parent || payload.type !== "comment" || !payload.text) return;
    try {
      await createReaction({
        clubId,
        bookId,
        page,
        type: "comment",
        text: payload.text,
        parentReactionId: parent._id,
      });
    } catch (err) {
      const code = (err as { data?: { code?: string } })?.data?.code;
      Alert.alert("Couldn't reply", code ?? "Please try again.");
    }
  };

  const handleDelete = (id: Id<"reactions">) => {
    Alert.alert(
      "Delete reaction?",
      "This can't be undone. Replies will be removed too.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await removeReaction({ reactionId: id });
              onClose();
            } catch (err) {
              const code = (err as { data?: { code?: string } })?.data?.code;
              Alert.alert("Couldn't delete", code ?? "Please try again.");
            }
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
        accessibilityLabel="Dismiss reaction details"
      />
      <View
        style={{
          backgroundColor: colors.surfacePrimary,
          borderTopLeftRadius: radius.lg,
          borderTopRightRadius: radius.lg,
          paddingHorizontal: spacing.s5,
          paddingTop: spacing.s4,
          paddingBottom: spacing.s5,
          maxHeight: "75%",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: spacing.s3,
          }}
        >
          <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>
            Reaction
          </Text>
          <Pressable
            onPress={onClose}
            hitSlop={spacing.s3}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <X size={22} color={colors.textPrimary} />
          </Pressable>
        </View>

        {parent === null ? (
          <Text style={{ ...typography.bodyMd, color: colors.textMuted }}>
            This reaction was removed.
          </Text>
        ) : (
          <ScrollView contentContainerStyle={{ gap: spacing.s4, paddingBottom: spacing.s4 }}>
            <ReactionRow
              avatarUri={parent.user.avatarUrl}
              name={parent.user.displayName}
              timestamp={parent.createdAt}
              body={
                parent.type === "emoji"
                  ? <Text style={{ fontSize: 28 }}>{parent.emoji}</Text>
                  : <Text style={{ ...typography.bodyLg, color: colors.textPrimary }}>{parent.text}</Text>
              }
              onDelete={
                currentUserId === parent.userId ? () => handleDelete(parent._id) : undefined
              }
            />

            {replies && replies.length > 0 ? (
              <View
                style={{
                  marginLeft: spacing.s5,
                  paddingLeft: spacing.s3,
                  borderLeftWidth: 2,
                  borderLeftColor: colors.border,
                  gap: spacing.s3,
                }}
              >
                {replies.map((r) => (
                  <ReactionRow
                    key={r._id}
                    avatarUri={r.user.avatarUrl}
                    name={r.user.displayName}
                    timestamp={r.createdAt}
                    body={
                      <Text style={{ ...typography.bodyMd, color: colors.textPrimary }}>
                        {r.text}
                      </Text>
                    }
                    onDelete={
                      currentUserId === r.userId ? () => handleDelete(r._id) : undefined
                    }
                  />
                ))}
              </View>
            ) : null}

            <Button
              label="Reply"
              variant="secondary"
              fullWidth
              leadingIcon={<MessageSquare size={18} color={palette.brandPrimary} />}
              onPress={() => setReplyOpen(true)}
            />
          </ScrollView>
        )}
      </View>

      <ReactionComposer
        visible={replyOpen}
        replyMode
        onClose={() => setReplyOpen(false)}
        onSubmit={handleReplySubmit}
      />
    </Modal>
  );
}

interface RowProps {
  avatarUri: string | undefined;
  name: string;
  timestamp: number;
  body: React.ReactNode;
  onDelete?: () => void;
}

function ReactionRow({ avatarUri, name, timestamp, body, onDelete }: RowProps) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: spacing.s3, alignItems: "flex-start" }}>
      <Avatar name={name} imageUri={avatarUri} size="md" />
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.s2 }}>
          <Text
            style={{ ...typography.bodyMd, color: colors.textPrimary, fontFamily: "Raleway-SemiBold" }}
          >
            {name}
          </Text>
          <Text style={{ ...typography.uiLabelMd, color: colors.textMuted }}>
            {formatRelative(timestamp)}
          </Text>
        </View>
        {body}
      </View>
      {onDelete ? (
        <Pressable
          onPress={onDelete}
          hitSlop={spacing.s3}
          accessibilityRole="button"
          accessibilityLabel="Delete"
        >
          <Trash2 size={18} color={palette.error} />
        </Pressable>
      ) : null}
    </View>
  );
}
