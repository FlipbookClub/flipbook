import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useMutation } from "convex/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/Button";
import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { OnboardingStackParamList } from "@/navigation/OnboardingStack";
import { api } from "../../../convex/_generated/api";

type Props = NativeStackScreenProps<OnboardingStackParamList, "GenrePreferences">;

// PRD § Functional Requirements > Profile setup: predefined list. Originally
// spec'd ≥3 required; founder relaxed to optional (users can add later from
// Profile/Settings).
const GENRES = [
  "Fiction",
  "Nonfiction",
  "Sci-Fi/Fantasy",
  "Romance",
  "Mystery/Thriller",
  "Memoir",
  "History",
  "Self-Help",
  "Poetry",
  "YA",
] as const;

export function GenrePreferencesScreen({ route }: Props) {
  const { colors } = useTheme();
  const { displayName, firstName, lastName } = route.params;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const createUser = useMutation(api.users.create);

  const toggle = (genre: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(genre)) {
        next.delete(genre);
      } else {
        next.add(genre);
      }
      return next;
    });
  };

  const submit = async (genres: string[]) => {
    setFormError(null);
    setSubmitting(true);
    try {
      await createUser({ displayName, firstName, lastName, genres });
      // RootNavigator's auth gate sees users.me become non-null and routes to
      // MainTabs automatically — no explicit navigation here.
    } catch (err) {
      const message =
        (err as { data?: { code?: string }; message?: string })?.data?.code ??
        (err as { message?: string })?.message ??
        "Couldn't save your profile. Mind trying again?";
      setFormError(
        message === "display_name_taken"
          ? `"${displayName}" is taken. Tap back to try another.`
          : message,
      );
      setSubmitting(false);
    }
  };

  const handleComplete = () => submit(Array.from(selected));
  const handleSkip = () => submit([]);

  return (
    <AuthLayout>
      <View style={{ gap: spacing.s1 }}>
        <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>
          What do you love to read?
        </Text>
        <Text style={{ ...typography.paragraphMd, color: colors.textSecondary }}>
          Pick a few so we can personalize your library. You can change these later.
        </Text>
      </View>

      <View
        style={{
          marginTop: spacing.s5,
          flexDirection: "row",
          flexWrap: "wrap",
          gap: spacing.s2,
        }}
      >
        {GENRES.map((genre) => {
          const isSelected = selected.has(genre);
          return (
            <Pressable
              key={genre}
              onPress={() => toggle(genre)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              style={{
                paddingVertical: spacing.s2,
                paddingHorizontal: spacing.s3,
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: isSelected ? palette.brandPrimary : colors.border,
                backgroundColor: isSelected ? palette.brandPrimary : "transparent",
              }}
            >
              <Text
                style={{
                  ...typography.uiLabelMd,
                  color: isSelected ? palette.textOnBrand : colors.textPrimary,
                }}
              >
                {genre}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      {formError ? (
        <Text
          style={{
            ...typography.bodySm,
            color: palette.error,
            textAlign: "center",
            marginBottom: spacing.s3,
          }}
        >
          {formError}
        </Text>
      ) : null}

      {selected.size > 0 ? (
        <Text
          style={{
            ...typography.bodySm,
            color: colors.textMuted,
            textAlign: "center",
            marginBottom: spacing.s2,
          }}
        >
          {selected.size} selected
        </Text>
      ) : null}
      <Button
        label={submitting ? "Saving…" : selected.size === 0 ? "Skip for now" : "Complete"}
        fullWidth
        disabled={submitting}
        onPress={selected.size === 0 ? handleSkip : handleComplete}
      />
    </AuthLayout>
  );
}
