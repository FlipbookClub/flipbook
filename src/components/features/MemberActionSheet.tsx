import { useState } from "react";
import { Alert, Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "convex/react";

import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";
import { Trash2, X } from "@/lib/icons";

import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

interface MemberActionSheetProps {
  visible: boolean;
  clubId: Id<"clubs">;
  userId: Id<"users">;
  displayName: string;
  onClose: () => void;
  onActionDone: () => void;
}

// Moderator-only action sheet for a club member. Offers two escalating actions:
// remove (they can rejoin via invite) and remove+block (they can't rejoin).
// Past reactions/progress/bookmarks are retained on both paths — block governs
// rejoin, not erasure, in keeping with the "never make the user feel blamed" voice.
export function MemberActionSheet({
  visible,
  clubId,
  userId,
  displayName,
  onClose,
  onActionDone,
}: MemberActionSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const removeMember = useMutation(api.memberships.removeMember);
  const blockMember = useMutation(api.memberships.blockMember);
  const [acting, setActing] = useState(false);

  const handleRemove = () => {
    Alert.alert(
      `Remove ${displayName}?`,
      "They'll lose access to this community but can rejoin via an invite link.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setActing(true);
            try {
              await removeMember({ clubId, userId });
              onActionDone();
              onClose();
            } catch {
              Alert.alert("Couldn't remove this member. Try again.");
            } finally {
              setActing(false);
            }
          },
        },
      ],
    );
  };

  const handleBlock = () => {
    Alert.alert(
      `Remove and block ${displayName}?`,
      "They'll be removed and won't be able to rejoin via invite links.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove & block",
          style: "destructive",
          onPress: async () => {
            setActing(true);
            try {
              await blockMember({ clubId, userId });
              onActionDone();
              onClose();
            } catch {
              Alert.alert("Couldn't block this member. Try again.");
            } finally {
              setActing(false);
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
    >
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: colors.surfacePrimary,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            paddingHorizontal: spacing.s5,
            paddingTop: spacing.s5,
            paddingBottom: spacing.s5 + insets.bottom,
            gap: spacing.s2,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.s1 }}>
            <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>
              {displayName}
            </Text>
            <Pressable onPress={onClose} hitSlop={spacing.s3} accessibilityRole="button" accessibilityLabel="Close">
              <X size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <SheetRow
            icon={<Trash2 size={20} color={palette.error} />}
            label="Remove from community"
            labelColor={palette.error}
            disabled={acting}
            onPress={handleRemove}
          />
          <SheetRow
            icon={<Trash2 size={20} color={palette.error} />}
            label="Remove & block from rejoining"
            labelColor={palette.error}
            disabled={acting}
            onPress={handleBlock}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SheetRow({
  icon,
  label,
  labelColor,
  onPress,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  labelColor?: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
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
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {icon}
      <Text style={{ ...typography.bodyLg, color: labelColor ?? colors.textPrimary }}>
        {label}
      </Text>
    </Pressable>
  );
}
