import { useState } from "react";
import { Alert, Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BookOpen, BookmarkCheck, Inbox, Pencil, Trash2, X } from "@/lib/icons";
import { useMutation } from "convex/react";

import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

export interface BookOptionsTarget {
  bookId: Id<"books">;
  title: string;
  status?: "current" | "library";
  /** Set once the book has ever been the current read — marks a "past" read. */
  hasBeenRead: boolean;
}

interface Props {
  visible: boolean;
  book: BookOptionsTarget | null;
  /** Moderator of the club — gated for set-current / retire. */
  isModerator: boolean;
  /** Moderator or the uploader — gated for edit / delete. */
  canManage: boolean;
  onClose: () => void;
  onOpenBook: () => void;
  onEdit: () => void;
  /** Called after a successful delete so the parent can refresh / dismiss. */
  onDeleted?: () => void;
}

// Per-book actions menu (the ⋮ on each library card). Set-current / retire and
// delete are run here directly; open + edit route out via callbacks. Visibility
// of each row follows the caller's permission flags.
export function BookOptionsSheet({
  visible,
  book,
  isModerator,
  canManage,
  onClose,
  onOpenBook,
  onEdit,
  onDeleted,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const setCurrentlyReading = useMutation(api.books.setCurrentlyReading);
  const moveToLibrary = useMutation(api.books.moveToLibrary);
  const removeBook = useMutation(api.books.remove);

  if (!book) return null;

  const isCurrent = book.status === "current";

  const runAndClose = async (fn: () => Promise<unknown>, failMsg: string) => {
    try {
      await fn();
      onClose();
    } catch {
      Alert.alert("Couldn't update", failMsg);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete book?",
      `"${book.title}" and everyone's reactions and progress on it will be permanently removed. This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await removeBook({ bookId: book.bookId });
              onClose();
              onDeleted?.();
            } catch {
              Alert.alert("Couldn't delete", "Please try again.");
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
        accessibilityLabel="Dismiss sheet"
      />
      <View
        style={{
          backgroundColor: colors.surfacePrimary,
          borderTopLeftRadius: radius.lg,
          borderTopRightRadius: radius.lg,
          paddingHorizontal: spacing.s4,
          paddingTop: spacing.s3,
          paddingBottom: spacing.s5 + insets.bottom,
          gap: spacing.s4,
        }}
      >
        <View
          style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
        >
          <Text style={{ ...typography.headingMd, color: colors.textPrimary }} numberOfLines={1}>
            {book.title}
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

        <View style={{ gap: spacing.s1 }}>
          <SheetRow
            icon={<BookOpen size={20} color={colors.textPrimary} />}
            label={book.hasBeenRead && !isCurrent ? "Read again" : "Open book"}
            onPress={() => {
              onClose();
              onOpenBook();
            }}
          />

          {isModerator && !isCurrent ? (
            <SheetRow
              icon={<BookmarkCheck size={20} color={colors.textPrimary} />}
              label="Set as currently reading"
              onPress={() =>
                runAndClose(
                  () => setCurrentlyReading({ bookId: book.bookId }),
                  "Please try again.",
                )
              }
            />
          ) : null}

          {isModerator && isCurrent ? (
            <SheetRow
              icon={<Inbox size={20} color={colors.textPrimary} />}
              label="Retire to library"
              onPress={() =>
                runAndClose(() => moveToLibrary({ bookId: book.bookId }), "Please try again.")
              }
            />
          ) : null}

          {canManage ? (
            <SheetRow
              icon={<Pencil size={20} color={colors.textPrimary} />}
              label="Edit metadata"
              onPress={() => {
                onClose();
                onEdit();
              }}
            />
          ) : null}

          {canManage ? (
            <SheetRow
              icon={<Trash2 size={20} color={palette.error} />}
              label="Delete book"
              labelColor={palette.error}
              onPress={handleDelete}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

interface SheetRowProps {
  icon: React.ReactNode;
  label: string;
  labelColor?: string;
  onPress: () => void;
}

function SheetRow({ icon, label, labelColor, onPress }: SheetRowProps) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.s3,
        paddingVertical: spacing.s3,
        paddingHorizontal: spacing.s3,
        borderRadius: radius.sm,
        backgroundColor: pressed ? colors.surfaceSecondary : "transparent",
      }}
    >
      {icon}
      <Text style={{ ...typography.bodyLg, color: labelColor ?? colors.textPrimary }}>{label}</Text>
    </Pressable>
  );
}
