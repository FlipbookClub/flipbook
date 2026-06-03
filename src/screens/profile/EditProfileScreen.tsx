import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ChevronLeft } from "@/lib/icons";
import { useMutation, useQuery } from "convex/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GENRES } from "@/lib/genres";
import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { ProfileStackParamList } from "@/navigation/ProfileStack";
import { api } from "../../../convex/_generated/api";

type Props = NativeStackScreenProps<ProfileStackParamList, "EditProfile">;

const MAX_DISPLAY_NAME = 50;
const MAX_BIO = 200;
const DEBOUNCE_MS = 350;

export function EditProfileScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const me = useQuery(api.users.me);
  const updateProfile = useMutation(api.users.update);

  const [seeded, setSeeded] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [genres, setGenres] = useState<Set<string>>(new Set());
  const [debounced, setDebounced] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Seed the form once the current user resolves.
  useEffect(() => {
    if (me && !seeded) {
      setDisplayName(me.displayName);
      setFirstName(me.firstName);
      setLastName(me.lastName);
      setBio(me.bio ?? "");
      setGenres(new Set(me.genres));
      setSeeded(true);
    }
  }, [me, seeded]);

  // Debounce the display-name availability check.
  const trimmedName = displayName.trim();
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(trimmedName), DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [trimmedName]);

  const original = me?.displayName ?? "";
  const nameChanged = trimmedName !== original;
  const localNameError =
    trimmedName.length === 0
      ? "Display name is required."
      : trimmedName.length > MAX_DISPLAY_NAME
        ? `Use ${MAX_DISPLAY_NAME} characters or fewer.`
        : null;

  // Only hit the server when the name actually changed and is locally valid.
  const shouldQuery = nameChanged && !localNameError && debounced === trimmedName;
  const availability = useQuery(
    api.users.isDisplayNameAvailable,
    shouldQuery ? { displayName: debounced } : "skip",
  );
  const serverNameError =
    shouldQuery && availability && !availability.available && availability.reason === "taken"
      ? `"${debounced}" is already taken.`
      : null;
  const checkingName = shouldQuery && availability === undefined;
  const nameError = localNameError ?? serverNameError;

  const toggleGenre = (g: string) => {
    setGenres((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  };

  const canSave =
    seeded &&
    !nameError &&
    !checkingName &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    bio.length <= MAX_BIO &&
    !submitting;

  const handleSave = async () => {
    if (!canSave) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await updateProfile({
        displayName: trimmedName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim(),
        genres: Array.from(genres),
      });
      navigation.goBack();
    } catch (err) {
      const code = (err as { data?: { code?: string } })?.data?.code;
      setFormError(
        code === "display_name_taken"
          ? `"${trimmedName}" is already taken.`
          : code === "bio_too_long"
            ? `Bio must be ${MAX_BIO} characters or fewer.`
            : "Couldn't save your changes. Try again?",
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
        <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>Edit profile</Text>
      </View>

      {!seeded ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.textMuted} />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ padding: spacing.s5, gap: spacing.s5, paddingBottom: spacing.s7 }}
            keyboardShouldPersistTaps="handled"
          >
            <Input
              label="Display name"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={MAX_DISPLAY_NAME}
              errorText={nameError ?? undefined}
              helperText={
                !nameError && checkingName
                  ? "Checking…"
                  : !nameError && nameChanged && availability?.available
                    ? `"${trimmedName}" is available.`
                    : undefined
              }
            />

            <View style={{ flexDirection: "row", gap: spacing.s3 }}>
              <Input
                containerStyle={{ flex: 1 }}
                label="First name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
              <Input
                containerStyle={{ flex: 1 }}
                label="Last name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>

            <Input
              label="Bio (optional)"
              value={bio}
              onChangeText={(t) => setBio(t.length > MAX_BIO ? t.slice(0, MAX_BIO) : t)}
              placeholder="A line about what you're reading."
              multiline
              numberOfLines={3}
              helperText={`${bio.length}/${MAX_BIO}`}
            />

            <View style={{ gap: spacing.s2 }}>
              <Text style={{ ...typography.overlineLg, color: colors.textPrimary }}>
                Genres
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.s2 }}>
                {GENRES.map((g) => {
                  const selected = genres.has(g);
                  return (
                    <Pressable
                      key={g}
                      onPress={() => toggleGenre(g)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      style={{
                        paddingVertical: spacing.s2,
                        paddingHorizontal: spacing.s3,
                        borderRadius: radius.pill,
                        borderWidth: 1,
                        borderColor: selected ? palette.brandPrimary : colors.border,
                        backgroundColor: selected ? palette.brandPrimary : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          ...typography.uiLabelMd,
                          color: selected ? palette.textOnBrand : colors.textPrimary,
                        }}
                      >
                        {g}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

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
