import { useState } from "react";
import { Alert, Modal, Pressable, Text, View } from "react-native";
import { Pencil, Trash2, X } from "lucide-react-native";
import { useMutation } from "convex/react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
  onDeleted: () => void;
}

type Pane = "menu" | "edit";

export function ClubModeratorSheet({ visible, club, onClose, onDeleted }: Props) {
  const { colors } = useTheme();
  const updateClub = useMutation(api.clubs.update);
  const removeClub = useMutation(api.clubs.remove);

  const [pane, setPane] = useState<Pane>("menu");
  const [name, setName] = useState(club.name);
  const [description, setDescription] = useState(club.description ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const reset = () => {
    setPane("menu");
    setName(club.name);
    setDescription(club.description ?? "");
    setFormError(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleSaveEdit = async () => {
    if (!name.trim()) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await updateClub({
        clubId: club._id as Id<"clubs">,
        name: name.trim(),
        description,
      });
      close();
    } catch (err) {
      const message =
        (err as { data?: { code?: string } })?.data?.code ??
        (err as { message?: string })?.message ??
        "Couldn't save changes.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

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
              close();
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
      onRequestClose={close}
      accessibilityViewIsModal
    >
      <Pressable
        onPress={close}
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
            {pane === "menu" ? "Manage community" : "Edit community"}
          </Text>
          <Pressable
            onPress={close}
            hitSlop={spacing.s3}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <X size={22} color={colors.textPrimary} />
          </Pressable>
        </View>

        {pane === "menu" ? (
          <View style={{ gap: spacing.s2 }}>
            <SheetRow
              icon={<Pencil size={20} color={colors.textPrimary} />}
              label="Edit community"
              onPress={() => setPane("edit")}
            />
            <SheetRow
              icon={<Trash2 size={20} color={palette.error} />}
              label="Delete community"
              labelColor={palette.error}
              onPress={handleDelete}
            />
          </View>
        ) : (
          <View style={{ gap: spacing.s4 }}>
            <Input
              variant="underline"
              placeholder="Club name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <Input
              variant="underline"
              placeholder="Club description (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
            {formError ? (
              <Text style={{ ...typography.bodySm, color: palette.error }}>{formError}</Text>
            ) : null}
            <Button
              label={submitting ? "Saving…" : "Save changes"}
              fullWidth
              disabled={submitting || !name.trim()}
              onPress={handleSaveEdit}
            />
          </View>
        )}
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
