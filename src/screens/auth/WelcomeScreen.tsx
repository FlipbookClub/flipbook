import { useState } from "react";
import { Text, View } from "react-native";
import { useConvex } from "convex/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { storage } from "@/lib/storage";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { AuthStackParamList } from "@/navigation/AuthStack";
import { api } from "../../../convex/_generated/api";

// Where the validated code is stashed for redemption at account creation
// (GenrePreferencesScreen → users.create). Keeps us from threading it through
// every onboarding screen's route params.
export const PENDING_INVITE_KEY = "auth.pendingInviteCode";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  const { colors, mode } = useTheme();
  const convex = useConvex();
  const [inviteCode, setInviteCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Link/accent text color matches the wordmark per mode: coral in Light + Flip,
  // GoldenSand in Dark. Figma's Text/Accent-text variable resolves to muted-plum
  // (#5d3a5a) in Light, but the "Sign in here" link is visually coral in the
  // Figma frame — using palette.accent here matches the design intent.
  const linkColor = mode === "dark" ? palette.highlight : palette.accent;

  // Validate the beta invite code (public query; no-op when gating is off), then
  // stash it for redemption at account creation. Sign-in (existing users) skips
  // this entirely.
  const handleSubmit = async () => {
    const code = inviteCode.trim();
    if (!code || checking) return;
    setChecking(true);
    setError(null);
    try {
      const res = await convex.query(api.invites.check, { code });
      if (!res.valid) {
        setError(
          res.reason === "already_used"
            ? "That code has already been used."
            : "That invite code isn't valid. Check the email we sent you.",
        );
        return;
      }
      storage.set(PENDING_INVITE_KEY, code);
      navigation.navigate("CreateAccount");
    } catch {
      setError("Couldn't verify that code. Check your connection and try again.");
    } finally {
      setChecking(false);
    }
  };
  const handleSignIn = () => navigation.navigate("SignIn");

  return (
    <AuthLayout>
      <View style={{ gap: spacing.s1 }}>
        <Text style={{ ...typography.headingLg, color: colors.textPrimary }}>
          Welcome to Flipbook
        </Text>
        <Text style={{ ...typography.paragraphMd, color: colors.textSecondary }}>
          Enter your special invite code.
        </Text>
      </View>

      <View style={{ marginTop: spacing.s5, gap: spacing.s2 }}>
        <Input
          variant="underline"
          placeholder="Invite code"
          autoCapitalize="characters"
          autoCorrect={false}
          value={inviteCode}
          onChangeText={(t) => {
            setInviteCode(t);
            if (error) setError(null);
          }}
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
          editable={!checking}
        />
        {error ? (
          <Text style={{ ...typography.bodySm, color: palette.error }}>{error}</Text>
        ) : null}
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ gap: spacing.s3 }}>
        <Text
          style={{
            ...typography.bodyMd,
            color: colors.textPrimary,
            textAlign: "center",
          }}
        >
          Already on Flipbook?{" "}
          <Text
            onPress={handleSignIn}
            style={{
              ...typography.bodyMd,
              color: linkColor,
              fontFamily: "Raleway-SemiBold",
            }}
          >
            Sign in here
          </Text>
        </Text>
        <Button
          label={checking ? "Checking…" : "Let me in"}
          fullWidth
          disabled={!inviteCode.trim() || checking}
          onPress={handleSubmit}
        />
      </View>
    </AuthLayout>
  );
}
