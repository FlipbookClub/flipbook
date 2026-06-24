import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { ImagePlus, ShieldCheck, X } from "@/lib/icons";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "convex/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { analytics } from "@/lib/analytics";
import { uploadImageToConvex } from "@/lib/uploads";
import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { CommunityStackParamList } from "@/navigation/CommunityStack";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

type Props = NativeStackScreenProps<CommunityStackParamList, "CreateCommunity">;

const MAX_NAME = 60;
const MAX_DESCRIPTION = 500;

export function CreateCommunityScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const createClub = useMutation(api.clubs.create);
  const generateEmblemUploadUrl = useMutation(api.clubs.generateEmblemUploadUrl);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [clubType, setClubType] = useState<"standard" | "creator">("standard");
  const [emblemUri, setEmblemUri] = useState<string | null>(null);
  const [emblemMime, setEmblemMime] = useState<string | null>(null);
  const [perms, setPerms] = useState({
    membersCanUploadBooks: false,
    membersCanInviteOthers: false,
    membersCanUpdateInfo: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && trimmedName.length <= MAX_NAME && !submitting;

  const pickEmblem = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setEmblemUri(result.assets[0].uri);
      setEmblemMime(result.assets[0].mimeType ?? "image/jpeg");
    }
  };

  const handleCreate = async () => {
    if (!canSubmit) return;
    setFormError(null);
    setSubmitting(true);
    try {
      // Stage the picked emblem to storage before creating the club, then hand
      // the storageId to `create`, which resolves it to a serving URL. (Earlier
      // this was dropped on the floor, so emblems set at creation never stuck.)
      let emblemStorageId: Id<"_storage"> | undefined;
      if (emblemUri) {
        const uploadUrl = await generateEmblemUploadUrl({});
        emblemStorageId = await uploadImageToConvex(
          uploadUrl,
          emblemUri,
          emblemMime ?? "image/jpeg",
        );
      }
      const { clubId, inviteCode } = await createClub({
        name: trimmedName,
        description: description.trim() || undefined,
        type: clubType,
        visibility: isPrivate ? "private" : "public",
        emblemStorageId,
        permissions: perms,
      });
      analytics.track("club_created", {
        type: clubType,
        visibility: isPrivate ? "private" : "public",
      });
      navigation.replace("InviteMembers", { clubId, inviteCode });
    } catch (err) {
      const code = (err as { data?: { code?: string } })?.data?.code;
      const message =
        code === "pro_required"
          ? "You're at the 3-club limit on the free tier. Flipbook Pro will lift the cap — coming soon."
          : code ?? (err as { message?: string })?.message ?? "Couldn't create the community. Please try again.";
      setFormError(message);
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: spacing.s4,
            paddingTop: spacing.s2,
            paddingBottom: spacing.s3,
          }}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={spacing.s3}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <X size={24} color={colors.textPrimary} />
          </Pressable>
          <ShieldCheck size={22} color={colors.textPrimary} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingBottom: spacing.s5, gap: spacing.s5 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ gap: spacing.s1 }}>
            <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>
              Create a new community
            </Text>
            <Text style={{ ...typography.paragraphMd, color: colors.textSecondary }}>
              Create a book community and invite your friends and members to join.
            </Text>
          </View>

          <Pressable
            onPress={pickEmblem}
            accessibilityRole="button"
            accessibilityLabel="Add community emblem"
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.s3,
            }}
          >
            {emblemUri ? (
              <Image
                source={{ uri: emblemUri }}
                style={{ width: 24, height: 24, borderRadius: radius.sm / 2 }}
              />
            ) : (
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: radius.sm / 2,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ImagePlus size={14} color={colors.textMuted} />
              </View>
            )}
            <Text style={{ ...typography.bodyMd, color: colors.textPrimary }}>
              {emblemUri ? "Change community emblem" : "Add community emblem"}
            </Text>
          </Pressable>

          <View style={{ gap: spacing.s4 }}>
            <Input
              variant="underline"
              placeholder="Club name"
              value={name}
              onChangeText={setName}
              maxLength={MAX_NAME}
              autoCapitalize="words"
              returnKeyType="next"
            />
            <Input
              variant="underline"
              placeholder="Club description (optional)"
              value={description}
              onChangeText={setDescription}
              maxLength={MAX_DESCRIPTION}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={{ gap: spacing.s2 }}>
            <Text style={{ ...typography.bodyLg, color: colors.textPrimary, fontFamily: "Raleway-SemiBold" }}>
              Community type
            </Text>
            <View style={{ flexDirection: "row", gap: spacing.s2 }}>
              {(["standard", "creator"] as const).map((type) => {
                const selected = clubType === type;
                return (
                  <Pressable
                    key={type}
                    onPress={() => setClubType(type)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: selected ? palette.brandPrimary : colors.border,
                      borderRadius: radius.md,
                      padding: spacing.s3,
                      gap: 2,
                      backgroundColor: selected ? colors.surfaceSecondary : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        ...typography.bodyMd,
                        color: colors.textPrimary,
                        fontFamily: "Raleway-SemiBold",
                      }}
                    >
                      {type === "standard" ? "Standard" : "Creator"}
                    </Text>
                    <Text style={{ ...typography.bodySm, color: colors.textMuted }}>
                      {type === "standard"
                        ? "Read a book together"
                        : "Publish chapters to subscribers"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View
            style={{ flexDirection: "row", alignItems: "center", gap: spacing.s3 }}
          >
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ true: palette.brandPrimary, false: colors.border }}
              thumbColor={palette.textOnBrand}
              accessibilityLabel="Make this community private"
            />
            <Text style={{ ...typography.bodyMd, color: colors.textPrimary, flex: 1 }}>
              Make this community private
            </Text>
          </View>

          <View style={{ gap: spacing.s2 }}>
            <View style={{ gap: 2 }}>
              <Text style={{ ...typography.bodyLg, color: colors.textPrimary, fontFamily: "Raleway-SemiBold" }}>
                Community permissions
              </Text>
              <Text style={{ ...typography.bodySm, color: colors.textMuted }}>
                (Permissions can be updated later)
              </Text>
            </View>
            <View style={{ gap: spacing.s1 }}>
              <Checkbox
                label="Allow community members upload books"
                checked={perms.membersCanUploadBooks}
                onChange={(v) => setPerms((p) => ({ ...p, membersCanUploadBooks: v }))}
              />
              <Checkbox
                label="Allow members invite other users to the club"
                checked={perms.membersCanInviteOthers}
                onChange={(v) => setPerms((p) => ({ ...p, membersCanInviteOthers: v }))}
              />
              <Checkbox
                label="Allow members update community info"
                checked={perms.membersCanUpdateInfo}
                onChange={(v) => setPerms((p) => ({ ...p, membersCanUpdateInfo: v }))}
              />
            </View>
          </View>

          {formError ? (
            <Text
              style={{
                ...typography.bodySm,
                color: palette.error,
                textAlign: "center",
              }}
            >
              {formError}
            </Text>
          ) : null}
        </ScrollView>

        <View style={{ paddingHorizontal: spacing.s4, paddingBottom: spacing.s5 }}>
          <Button
            label={submitting ? "Creating…" : "Create community"}
            fullWidth
            disabled={!canSubmit}
            onPress={handleCreate}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
