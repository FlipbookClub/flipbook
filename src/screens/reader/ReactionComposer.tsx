import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { MessageSquare, X } from "@/lib/icons";

import { Button } from "@/components/ui/Button";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

// FR-014: curated set, stays in sync with ALLOWED_EMOJIS in convex/reactions.ts.
export const CURATED_EMOJIS = ["🔥", "❤️", "😭", "🤯", "💀", "✨"] as const;
const MAX_COMMENT_LENGTH = 200;

type Stage = "picker" | "comment";

export interface ReactionSubmission {
  type: "emoji" | "comment";
  emoji?: string;
  text?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  // Resolves once the optimistic call has been initiated; the caller is
  // responsible for making the Convex mutation. Errors caught upstream.
  onSubmit: (payload: ReactionSubmission) => void | Promise<void>;
  // When set, the composer opens directly in reply mode (skips emoji picker
  // and shows the comment field). Used from the reactions details sheet.
  replyMode?: boolean;
}

export function ReactionComposer({ visible, onClose, onSubmit, replyMode = false }: Props) {
  const { colors } = useTheme();
  const [stage, setStage] = useState<Stage>(replyMode ? "comment" : "picker");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) {
      setStage(replyMode ? "comment" : "picker");
      setText("");
      setSubmitting(false);
    }
  }, [visible, replyMode]);

  useEffect(() => {
    if (visible && stage === "comment") {
      // Slight delay lets the modal animation finish before the keyboard
      // animates in, so the field doesn't jump mid-transition.
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [visible, stage]);

  const handleEmojiTap = async (emoji: string) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({ type: "emoji", emoji });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({ type: "comment", text: trimmed });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}
        accessibilityLabel="Dismiss reaction picker"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
      >
        <View
          style={{
            backgroundColor: colors.surfacePrimary,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            paddingHorizontal: spacing.s5,
            paddingTop: spacing.s4,
            paddingBottom: spacing.s5,
            gap: spacing.s4,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>
              {stage === "picker"
                ? "React"
                : replyMode
                  ? "Reply"
                  : "Add a comment"}
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

          {stage === "picker" ? (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: spacing.s2,
                }}
              >
                {CURATED_EMOJIS.map((e) => (
                  <Pressable
                    key={e}
                    onPress={() => handleEmojiTap(e)}
                    disabled={submitting}
                    accessibilityRole="button"
                    accessibilityLabel={`React with ${e}`}
                    style={({ pressed }) => ({
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: pressed
                        ? colors.surfaceSecondary
                        : "transparent",
                    })}
                  >
                    <Text style={{ fontSize: 30 }}>{e}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable
                onPress={() => setStage("comment")}
                accessibilityRole="button"
                accessibilityLabel="Add a comment"
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.s3,
                  paddingVertical: spacing.s3,
                  paddingHorizontal: spacing.s3,
                  borderRadius: radius.sm,
                  backgroundColor: pressed
                    ? colors.surfaceSecondary
                    : "transparent",
                })}
              >
                <MessageSquare size={20} color={colors.textPrimary} />
                <Text style={{ ...typography.bodyLg, color: colors.textPrimary }}>
                  Comment instead
                </Text>
              </Pressable>
            </>
          ) : (
            <View style={{ gap: spacing.s3 }}>
              <TextInput
                ref={inputRef}
                value={text}
                onChangeText={(t) =>
                  setText(t.length > MAX_COMMENT_LENGTH ? t.slice(0, MAX_COMMENT_LENGTH) : t)
                }
                placeholder={replyMode ? "Write a reply…" : "Share a thought…"}
                placeholderTextColor={colors.textMuted}
                multiline
                returnKeyType="default"
                style={{
                  ...typography.bodyLg,
                  color: colors.textPrimary,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  padding: spacing.s3,
                  minHeight: 96,
                  textAlignVertical: "top",
                }}
                accessibilityLabel="Comment text"
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: spacing.s3,
                }}
              >
                <Text style={{ ...typography.uiLabelMd, color: colors.textMuted }}>
                  {text.length}/{MAX_COMMENT_LENGTH}
                </Text>
                <View style={{ flexDirection: "row", gap: spacing.s2 }}>
                  {!replyMode ? (
                    <Button
                      label="Back"
                      variant="alt"
                      size="md"
                      onPress={() => setStage("picker")}
                      disabled={submitting}
                    />
                  ) : null}
                  <Button
                    label={submitting ? "Sending…" : "Send"}
                    size="md"
                    onPress={handleCommentSubmit}
                    disabled={submitting || text.trim().length === 0}
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
