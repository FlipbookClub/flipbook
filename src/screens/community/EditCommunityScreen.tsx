import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { ChevronLeft, ImagePlus } from "@/lib/icons";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQuery } from "convex/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { uploadImageToConvex } from "@/lib/uploads";
import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { CommunityStackParamList } from "@/navigation/CommunityStack";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

type Props = NativeStackScreenProps<CommunityStackParamList, "EditCommunity">;

const MAX_NAME = 60;
const MAX_DESCRIPTION = 500;

export function EditCommunityScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { clubId } = route.params;
  const club = useQuery(api.clubs.get, { clubId });
  const me = useQuery(api.users.me);
  const generateEmblemUploadUrl = useMutation(api.clubs.generateEmblemUploadUrl);
  const updateClub = useMutation(api.clubs.update);

  // Only the moderator sees governance controls (visibility + permissions);
  // permitted members can edit info (emblem/name/description) only.
  const isModerator = !!me && !!club && club.moderatorId === me._id;

  const [seeded, setSeeded] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [perms, setPerms] = useState({
    membersCanUploadBooks: false,
    membersCanInviteOthers: false,
    membersCanUpdateInfo: false,
  });
  // null = keep existing; a local uri = a freshly-picked emblem to upload.
  const [newEmblemUri, setNewEmblemUri] = useState<string | null>(null);
  const [newEmblemMime, setNewEmblemMime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (club && !seeded) {
      setName(club.name);
      setDescription(club.description ?? "");
      setIsPrivate(club.visibility === "private");
      setPerms(club.permissions);
      setSeeded(true);
    }
  }, [club, seeded]);

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
      setNewEmblemUri(result.assets[0].uri);
      setNewEmblemMime(result.assets[0].mimeType ?? "image/jpeg");
    }
  };

  const trimmedName = name.trim();
  const canSave = seeded && trimmedName.length > 0 && trimmedName.length <= MAX_NAME && !submitting;
  const emblemPreview = newEmblemUri ?? club?.coverImageUrl ?? null;

  const handleSave = async () => {
    if (!canSave) return;
    setFormError(null);
    setSubmitting(true);
    try {
      let emblemStorageId: Id<"_storage"> | undefined;
      if (newEmblemUri) {
        const uploadUrl = await generateEmblemUploadUrl({ clubId });
        emblemStorageId = await uploadImageToConvex(
          uploadUrl,
          newEmblemUri,
          newEmblemMime ?? "image/jpeg",
        );
      }
      await updateClub({
        clubId,
        name: trimmedName,
        description,
        visibility: isPrivate ? "private" : "public",
        permissions: perms,
        emblemStorageId,
      });
      navigation.goBack();
    } catch (err) {
      const code = (err as { data?: { code?: string } })?.data?.code;
      setFormError(
        code === "invalid_name"
          ? "Give the community a name."
          : code === "description_too_long"
            ? `Description must be ${MAX_DESCRIPTION} characters or fewer.`
            : code === "not_moderator"
              ? "Only the moderator can edit this community."
              : "Couldn't save changes. Try again?",
      );
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.s3,
          paddingHorizontal: spacing.s4,
          paddingTop: spacing.s2,
          paddingBottom: spacing.s3,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={spacing.s3}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>Edit community</Text>
      </View>

      {!seeded ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.textMuted} />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ padding: spacing.s5, gap: spacing.s5, paddingBottom: spacing.s7 }}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable
              onPress={pickEmblem}
              accessibilityRole="button"
              accessibilityLabel="Change community emblem"
              style={{ flexDirection: "row", alignItems: "center", gap: spacing.s3 }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: radius.md,
                  overflow: "hidden",
                  backgroundColor: colors.surfaceSecondary,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                {emblemPreview ? (
                  <Image source={{ uri: emblemPreview }} style={{ width: "100%", height: "100%" }} />
                ) : (
                  <ImagePlus size={22} color={colors.textMuted} />
                )}
              </View>
              <Text style={{ ...typography.bodyMd, color: colors.textAccent, fontFamily: "Raleway-SemiBold" }}>
                {emblemPreview ? "Change emblem" : "Add emblem"}
              </Text>
            </Pressable>

            <Input
              label="Community name"
              value={name}
              onChangeText={setName}
              maxLength={MAX_NAME}
              autoCapitalize="words"
            />
            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              maxLength={MAX_DESCRIPTION}
              placeholder="What's this community about?"
              multiline
              numberOfLines={3}
            />

            {isModerator ? (
              <>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.s3 }}>
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
                  <Text
                    style={{
                      ...typography.bodyLg,
                      color: colors.textPrimary,
                      fontFamily: "Raleway-SemiBold",
                    }}
                  >
                    Community permissions
                  </Text>
                  <View style={{ gap: spacing.s1 }}>
                    <Checkbox
                      label="Allow members to upload books"
                      checked={perms.membersCanUploadBooks}
                      onChange={(v) => setPerms((p) => ({ ...p, membersCanUploadBooks: v }))}
                    />
                    <Checkbox
                      label="Allow members to invite others"
                      checked={perms.membersCanInviteOthers}
                      onChange={(v) => setPerms((p) => ({ ...p, membersCanInviteOthers: v }))}
                    />
                    <Checkbox
                      label="Allow members to update community info"
                      checked={perms.membersCanUpdateInfo}
                      onChange={(v) => setPerms((p) => ({ ...p, membersCanUpdateInfo: v }))}
                    />
                  </View>
                </View>
              </>
            ) : null}

            {formError ? (
              <Text style={{ ...typography.bodySm, color: palette.error, textAlign: "center" }}>
                {formError}
              </Text>
            ) : null}

            <Button
              label={submitting ? "Saving…" : "Save changes"}
              fullWidth
              disabled={!canSave}
              onPress={handleSave}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
