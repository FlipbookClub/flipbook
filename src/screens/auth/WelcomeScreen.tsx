import { useState } from "react";
import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { AuthStackParamList } from "@/navigation/AuthStack";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  const { colors, mode } = useTheme();
  const [inviteCode, setInviteCode] = useState("");

  // Link/accent text color matches the wordmark per mode: coral in Light + Flip,
  // GoldenSand in Dark. Figma's Text/Accent-text variable resolves to muted-plum
  // (#5d3a5a) in Light, but the "Sign in here" link is visually coral in the
  // Figma frame — using palette.accent here matches the design intent.
  const linkColor = mode === "dark" ? palette.highlight : palette.accent;

  // Invite-code validation lands in TASK-031 (clubs.acceptInvite); for now we
  // just gate the CTA on non-empty input and proceed to account creation.
  const handleSubmit = () => {
    if (!inviteCode.trim()) return;
    navigation.navigate("CreateAccount");
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

      <View style={{ marginTop: spacing.s5 }}>
        <Input
          variant="underline"
          placeholder="Invite code"
          autoCapitalize="characters"
          autoCorrect={false}
          value={inviteCode}
          onChangeText={setInviteCode}
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />
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
          label="Let me in"
          fullWidth
          disabled={!inviteCode.trim()}
          onPress={handleSubmit}
        />
      </View>
    </AuthLayout>
  );
}
