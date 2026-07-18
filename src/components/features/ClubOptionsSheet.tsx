import { useState } from "react";
import { Alert, Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogOut, Pencil, Trash2, X } from "@/lib/icons";
import { useMutation } from "convex/react";

import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

interface Props {
  visible: boolean;
  club: Doc<"clubs">;
  onClose: () => void;
  isModerator: boolean;
  // True for the moderator, or a member whose club grants membersCanUpdateInfo.
  canEditInfo: boolean;
  /** Open the full Edit Community page (editing is its own screen, not a sheet). */
  onEdit: () => void;
  onDeleted: () => void;
  onLeft: () => void;
}

// Unified club options sheet reached from the bottom action tray's gear icon.
// Row set adapts by role: moderator gets Edit + Delete; a member with edit
// permission gets Edit + Leave; a plain member gets Leave only.
export function ClubOptionsSheet({
  visible,
  club,
  onClose,
  isModerator,
  canEditInfo,
  onEdit,
  onDeleted,
  onLeft,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const removeClub = useMutation(api.clubs.remove);
  const leaveClub = useMutation(api.memberships.leave);

  const handleDelete = () => {
    Alert.alert(
      "Delete community?",
      `"${club.name}" and all its memberships will be permanently removed. This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await removeClub({ clubId: club._id as Id<"clubs"> });
              onClose();
              onDeleted();
            } catch (err) {
              const message =
                (err as { message?: string })?.message ?? "Couldn't delete the community.";
              Alert.alert("Couldn't delete", message);
            }
          },
        },
      ],
    );
  };

  const handleLeave = () => {
    Alert.alert(
      "Leave this community?",
      "You'll need a new invite to rejoin. Your past reactions and progress stay put.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              await leaveClub({ clubId: club._id as Id<"clubs"> });
              onClose();
              onLeft();
            } catch {
              Alert.alert("Couldn't leave", "Please check your connection and try again.");
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
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>
            Community options
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

        <View style={{ gap: spacing.s2 }}>
          {canEditInfo ? (
            <SheetRow
              icon={<Pencil size={20} color={colors.textPrimary} />}
              label="Edit community"
              onPress={() => {
                onClose();
                onEdit();
              }}
            />
          ) : null}
          {isModerator ? (
            <SheetRow
              icon={<Trash2 size={20} color={palette.error} />}
              label="Delete community"
              labelColor={palette.error}
              onPress={handleDelete}
            />
          ) : (
            <SheetRow
              icon={<LogOut size={20} color={palette.error} />}
              label="Leave community"
              labelColor={palette.error}
              onPress={handleLeave}
            />
          )}
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
