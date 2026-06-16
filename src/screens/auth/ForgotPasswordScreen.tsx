import { useState } from "react";
import { Text, View } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { AuthStackParamList } from "@/navigation/AuthStack";

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Step 1 of the password-reset flow. Kicks off Clerk's `reset_password_email_code`
// strategy, which emails a code, then routes to ResetPasswordScreen to collect the
// code + new password. See ResetPasswordScreen for steps 2–3.
export function ForgotPasswordScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { isLoaded, signIn } = useSignIn();

  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const emailError =
    emailTouched && email.trim().length > 0 && !EMAIL_RE.test(email.trim())
      ? "That doesn't look like an email address."
      : null;
  const canSubmit = isLoaded && EMAIL_RE.test(email.trim()) && !submitting;

  const handleSend = async () => {
    if (!isLoaded || !signIn || !canSubmit) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });
      navigation.navigate("ResetPassword", { email: email.trim() });
    } catch (err) {
      const message =
        (err as { errors?: { message?: string }[] })?.errors?.[0]?.message ??
        "Couldn't start a password reset. Check the email and try again.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>
        Reset your password
      </Text>
      <Text
        style={{
          ...typography.paragraphMd,
          color: colors.textSecondary,
          marginTop: spacing.s1,
        }}
      >
        Enter your email and we'll send a code to set a new password.
      </Text>

      <View style={{ marginTop: spacing.s5 }}>
        <Input
          variant="underline"
          placeholder="Email address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          onBlur={() => setEmailTouched(true)}
          errorText={emailError ?? undefined}
          returnKeyType="go"
          onSubmitEditing={handleSend}
        />
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

      <Button
        label={submitting ? "Sending…" : "Send reset code"}
        fullWidth
        disabled={!canSubmit}
        onPress={handleSend}
      />
    </AuthLayout>
  );
}
