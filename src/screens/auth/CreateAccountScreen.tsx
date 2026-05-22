import { useState } from "react";
import { Text, View } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppleAuthButton } from "@/components/auth/AppleAuthButton";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSocialAuth } from "@/hooks/useSocialAuth";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { AuthStackParamList } from "@/navigation/AuthStack";

type Props = NativeStackScreenProps<AuthStackParamList, "CreateAccount">;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePassword(value: string): string | null {
  if (value.length < 8) return "Use 8 characters or more.";
  if (!/\d/.test(value)) return "Must contain a number.";
  return null;
}

export function CreateAccountScreen({ navigation }: Props) {
  const { colors, mode } = useTheme();
  const { isLoaded, signUp } = useSignUp();
  const { startFlow, providerInFlight, error: socialError } = useSocialAuth();

  // Mode-aware accent for inline links (same convention as SignIn / Welcome).
  const linkColor = mode === "dark" ? palette.highlight : palette.accent;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const passwordError = passwordTouched ? validatePassword(password) : null;
  const canSubmit =
    isLoaded && EMAIL_RE.test(email.trim()) && validatePassword(password) === null && !submitting;

  const handleSignUp = async () => {
    if (!isLoaded || !canSubmit) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await signUp.create({ emailAddress: email.trim(), password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      navigation.navigate("VerifyEmail", { email: email.trim() });
    } catch (err) {
      // Same session_exists handling as SignInScreen — a cached session
      // means the user is already signed up + signed in, let the auth gate
      // route forward instead of erroring at them.
      const errors = (err as { errors?: { code?: string; message?: string }[] })?.errors;
      const code = errors?.[0]?.code;
      if (code === "session_exists") {
        setFormError(null);
        return;
      }
      setFormError(errors?.[0]?.message ?? "Sign-up failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApple = () => startFlow("oauth_apple");
  const handleGoogle = () => startFlow("oauth_google");

  return (
    <AuthLayout>
      <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>
        Create your account
      </Text>

      <View style={{ marginTop: spacing.s5, gap: spacing.s4 }}>
        <Input
          variant="underline"
          placeholder="Email address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          returnKeyType="next"
        />
        <Input
          variant="underline"
          placeholder="Password"
          autoCapitalize="none"
          autoComplete="password-new"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onBlur={() => setPasswordTouched(true)}
          errorText={passwordError ?? undefined}
          returnKeyType="go"
          onSubmitEditing={handleSignUp}
        />
      </View>

      <View style={{ marginTop: spacing.s5, gap: spacing.s3 }}>
        <Text
          style={{ ...typography.bodyMd, color: colors.textMuted, textAlign: "center" }}
        >
          or
        </Text>
        <AppleAuthButton
          label="Sign up with Apple"
          onPress={handleApple}
          disabled={providerInFlight !== null}
        />
        <GoogleAuthButton
          label="Sign up with Google"
          onPress={handleGoogle}
          disabled={providerInFlight !== null}
        />
      </View>

      <View style={{ flex: 1 }} />

      {(formError || socialError) ? (
        <Text
          style={{
            ...typography.bodySm,
            color: palette.error,
            textAlign: "center",
            marginBottom: spacing.s3,
          }}
        >
          {formError ?? socialError}
        </Text>
      ) : null}

      <View style={{ gap: spacing.s3 }}>
        <Text style={{ ...typography.bodyMd, color: colors.textPrimary, textAlign: "center" }}>
          Already have an account?{" "}
          <Text
            onPress={() => navigation.navigate("SignIn")}
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
          label={submitting ? "Signing up…" : "Sign up"}
          fullWidth
          disabled={!canSubmit}
          onPress={handleSignUp}
        />
      </View>
    </AuthLayout>
  );
}
