import { useState } from "react";
import { Alert, Modal, Pressable, Text, View } from "react-native";
import { Pencil, Trash2, X } from "lucide-react-native";
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
  /** Open the full Edit Community page (editing is its own screen, not a sheet). */
  onEdit: () => void;
  onDeleted: () => void;
}

// Moderator actions sheet — a short menu only. Editing lives on its own page
// (EditCommunityScreen) so the form gets full-screen space + clean keyboard
// handling; this sheet just routes there or deletes.
export function ClubModeratorSheet({ visible, club, onClose, onEdit, onDeleted }: Props) {
  const { colors } = useTheme();
  const removeClub = useMutation(api.clubs.remove);

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
            Manage community
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
          <SheetRow
            icon={<Pencil size={20} color={colors.textPrimary} />}
            label="Edit community"
            onPress={() => {
              onClose();
              onEdit();
            }}
          />
          <SheetRow
            icon={<Trash2 size={20} color={palette.error} />}
            label="Delete community"
            labelColor={palette.error}
            onPress={handleDelete}
          />
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
