import { useState } from "react";
import { Alert, Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "convex/react";

import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";
import { ShieldCheck, Trash2, X } from "@/lib/icons";

import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

// setMemberRole's known ConvexError codes (convex/memberships.ts), mapped to
// copy a member can act on. Falls back to the raw code (still more useful
// than a silent generic message) rather than masking unexpected failures.
function describeRoleError(err: unknown): string {
  const code = (err as { data?: { code?: string } } | undefined)?.data?.code;
  switch (code) {
    case "not_moderator":
      return "Only a moderator can do that.";
    case "cannot_change_owner_role":
      return "The community owner's role can't be changed.";
    case "not_member":
      return "They're no longer a member of this community.";
    case "club_not_found":
      return "This community couldn't be found.";
    default:
      return code ?? "Couldn't update their role. Try again.";
  }
}

interface MemberActionSheetProps {
  visible: boolean;
  clubId: Id<"clubs">;
  userId: Id<"users">;
  displayName: string;
  // The target member's current role, and whether the viewer opening this
  // sheet is the club's original owner (not just any moderator) — governs
  // which rows render. See handlePromote/handleDemote below and the
  // corresponding server-side guards in convex/memberships.ts.
  targetRole: "moderator" | "member";
  viewerIsOwner: boolean;
  onClose: () => void;
  onActionDone: () => void;
}

// Moderator-only action sheet for a club member. Any moderator (owner or
// delegate) can promote a regular member or remove/block them. Demoting,
// removing, or blocking another MODERATOR is owner-only — enforced both here
// (row visibility) and server-side (the real guard). Past reactions/progress/
// bookmarks are retained on every path — block governs rejoin, not erasure,
// in keeping with the "never make the user feel blamed" voice.
export function MemberActionSheet({
  visible,
  clubId,
  userId,
  displayName,
  targetRole,
  viewerIsOwner,
  onClose,
  onActionDone,
}: MemberActionSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const removeMember = useMutation(api.memberships.removeMember);
  const blockMember = useMutation(api.memberships.blockMember);
  const setMemberRole = useMutation(api.memberships.setMemberRole);
  const [acting, setActing] = useState(false);

  const handlePromote = () => {
    Alert.alert(
      `Make ${displayName} a moderator?`,
      "They'll be able to manage regular members and upload books, same as you.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Make moderator",
          onPress: async () => {
            setActing(true);
            try {
              await setMemberRole({ clubId, userId, role: "moderator" });
              onActionDone();
              onClose();
            } catch (err) {
              Alert.alert(describeRoleError(err));
            } finally {
              setActing(false);
            }
          },
        },
      ],
    );
  };

  const handleDemote = () => {
    Alert.alert(
      `Remove ${displayName} as moderator?`,
      "They'll go back to being a regular member.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove moderator",
          style: "destructive",
          onPress: async () => {
            setActing(true);
            try {
              await setMemberRole({ clubId, userId, role: "member" });
              onActionDone();
              onClose();
            } catch (err) {
              Alert.alert(describeRoleError(err));
            } finally {
              setActing(false);
            }
          },
        },
      ],
    );
  };

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

          {targetRole === "member" ? (
            <SheetRow
              icon={<ShieldCheck size={20} color={colors.textPrimary} />}
              label="Make moderator"
              disabled={acting}
              onPress={handlePromote}
            />
          ) : null}
          {targetRole === "moderator" && viewerIsOwner ? (
            <SheetRow
              icon={<ShieldCheck size={20} color={colors.textPrimary} />}
              label="Remove moderator status"
              disabled={acting}
              onPress={handleDemote}
            />
          ) : null}
          {targetRole === "member" || viewerIsOwner ? (
            <>
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
            </>
          ) : null}
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
