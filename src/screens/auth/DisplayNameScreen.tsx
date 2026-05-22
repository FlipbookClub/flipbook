import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useQuery } from "convex/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { OnboardingStackParamList } from "@/navigation/OnboardingStack";
import { api } from "../../../convex/_generated/api";

type Props = NativeStackScreenProps<OnboardingStackParamList, "DisplayName">;

const MAX_DISPLAY_NAME = 50;
const DEBOUNCE_MS = 350;

function localValidation(trimmed: string): string | null {
  if (trimmed.length === 0) return null; // empty = no error yet, just no submit
  if (trimmed.length > MAX_DISPLAY_NAME) return `Use ${MAX_DISPLAY_NAME} characters or fewer.`;
  return null;
}

export function DisplayNameScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [debounced, setDebounced] = useState("");

  // Debounce so we don't fire a Convex query on every keystroke.
  useEffect(() => {
    const trimmed = displayName.trim();
    const handle = setTimeout(() => setDebounced(trimmed), DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [displayName]);

  const trimmed = displayName.trim();
  const localError = localValidation(trimmed);

  // Skip the query until we have a debounced, locally-valid name.
  const shouldQuery = !!debounced && localValidation(debounced) === null;
  const availability = useQuery(
    api.users.isDisplayNameAvailable,
    shouldQuery ? { displayName: debounced } : "skip",
  );

  // Determine the surface error / state. Server check supersedes local check
  // once it's resolved for the current debounced value.
  const serverError =
    shouldQuery && availability && !availability.available
      ? availability.reason === "taken"
        ? `"${debounced}" is already taken.`
        : availability.reason === "too_long"
          ? `Use ${MAX_DISPLAY_NAME} characters or fewer.`
          : null
      : null;

  const checking =
    shouldQuery && (availability === undefined || debounced !== trimmed);
  const isAvailable =
    shouldQuery &&
    availability?.available === true &&
    debounced === trimmed &&
    !localError;

  const error = localError ?? serverError ?? undefined;
  const canSubmit = isAvailable && !checking;

  const handleContinue = () => {
    if (!canSubmit) return;
    navigation.navigate("UserDetails", { displayName: trimmed });
  };

  return (
    <AuthLayout>
      <View style={{ gap: spacing.s1 }}>
        <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>
          Set your display name
        </Text>
        <Text style={{ ...typography.paragraphMd, color: colors.textSecondary }}>
          Use a name you want to be identified with. This will be your public display name.
        </Text>
      </View>

      <View style={{ marginTop: spacing.s5 }}>
        <Input
          variant="underline"
          placeholder="Username"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          maxLength={MAX_DISPLAY_NAME}
          value={displayName}
          onChangeText={setDisplayName}
          errorText={error}
          helperText={
            !error
              ? checking
                ? "Checking…"
                : isAvailable
                  ? `"${trimmed}" is available.`
                  : undefined
              : undefined
          }
          returnKeyType="next"
          onSubmitEditing={handleContinue}
        />
      </View>

      <View style={{ flex: 1 }} />

      <Button label="Continue" fullWidth disabled={!canSubmit} onPress={handleContinue} />
    </AuthLayout>
  );
}
