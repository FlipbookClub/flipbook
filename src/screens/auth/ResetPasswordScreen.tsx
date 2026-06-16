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

type Props = NativeStackScreenProps<AuthStackParamList, "ResetPassword">;

const CODE_LENGTH = 6;
const MIN_PASSWORD = 8;

// Steps 2–3 of the password-reset flow (step 1 is ForgotPasswordScreen):
//   2. attemptFirstFactor(reset_password_email_code, code) → needs_new_password
//   3. resetPassword({ password })                         → complete → setActive
// On success the RootNavigator auth gate routes the now-signed-in user forward.
export function ResetPasswordScreen({ route }: Props) {
  const { colors } = useTheme();
  const { isLoaded, signIn, setActive } = useSignIn();
  const email = route.params.email;

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentNotice, setResentNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const canSubmit =
    isLoaded && code.length === CODE_LENGTH && password.length >= MIN_PASSWORD && !submitting;

  const handleReset = async () => {
    if (!isLoaded || !signIn || !setActive || !canSubmit) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      });
      if (attempt.status === "needs_new_password") {
        const done = await signIn.resetPassword({ password });
        if (done.status === "complete") {
          await setActive({ session: done.createdSessionId });
          return;
        }
        setFormError("Couldn't set the new password. Please try again.");
      } else if (attempt.status === "complete") {
        // Some configurations complete without a discrete new-password step.
        await setActive({ session: attempt.createdSessionId });
      } else {
        setFormError("That code didn't work. Check it and try again.");
      }
    } catch (err) {
      const message =
        (err as { errors?: { message?: string }[] })?.errors?.[0]?.message ??
        "Couldn't reset your password. Please try again.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded || !signIn) return;
    setFormError(null);
    setResentNotice(null);
    setResending(true);
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier: email });
      setResentNotice("We sent a new code.");
    } catch (err) {
      const message =
        (err as { errors?: { message?: string }[] })?.errors?.[0]?.message ??
        "Couldn't resend the code.";
      setFormError(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>
        Set a new password
      </Text>
      <Text
        style={{
          ...typography.paragraphMd,
          color: colors.textSecondary,
          marginTop: spacing.s1,
        }}
      >
        Enter the {CODE_LENGTH}-digit code we sent to {email}, then choose a new password
        (at least {MIN_PASSWORD} characters).
      </Text>

      <View style={{ marginTop: spacing.s5, gap: spacing.s4 }}>
        <Input
          variant="underline"
          placeholder={`${CODE_LENGTH}-digit code`}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          maxLength={CODE_LENGTH}
          value={code}
          onChangeText={(text) => setCode(text.replace(/\D/g, ""))}
        />
        <Input
          variant="underline"
          placeholder="New password"
          autoCapitalize="none"
          autoComplete="password-new"
          autoCorrect={false}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          returnKeyType="go"
          onSubmitEditing={handleReset}
        />
      </View>

      <View style={{ marginTop: spacing.s3 }}>
        <Text
          onPress={handleResend}
          style={{
            ...typography.bodyMd,
            color: resending ? colors.textMuted : colors.textPrimary,
            fontFamily: "Raleway-SemiBold",
          }}
        >
          {resending ? "Sending…" : "Resend code"}
        </Text>
        {resentNotice ? (
          <Text
            style={{ ...typography.bodySm, color: colors.textMuted, marginTop: spacing.s1 }}
          >
            {resentNotice}
          </Text>
        ) : null}
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
        label={submitting ? "Updating…" : "Reset password"}
        fullWidth
        disabled={!canSubmit}
        onPress={handleReset}
      />
    </AuthLayout>
  );
}
