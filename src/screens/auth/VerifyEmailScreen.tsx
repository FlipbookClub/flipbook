import { useState } from "react";
import { Text, View } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { AuthStackParamList } from "@/navigation/AuthStack";

type Props = NativeStackScreenProps<AuthStackParamList, "VerifyEmail">;

const CODE_LENGTH = 6;

// Email-verification step inserted between CreateAccount and the rest of the
// onboarding flow. Clerk requires verification before `setActive` makes the
// user truly signed-in. Not in Figma (the design jumps straight from email
// to display name) — visual style intentionally matches the other auth
// screens so it reads as part of the same flow.
export function VerifyEmailScreen({ route }: Props) {
  const { colors } = useTheme();
  const { isLoaded, signUp, setActive } = useSignUp();
  const email = route.params.email;

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resentNotice, setResentNotice] = useState<string | null>(null);

  const canSubmit = isLoaded && code.length === CODE_LENGTH && !submitting;

  const handleVerify = async () => {
    if (!isLoaded || !canSubmit) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        // RootNavigator (TASK-021) will route to profile-setup since no Convex user yet.
      } else {
        setFormError("Verification incomplete. Check the code and try again.");
      }
    } catch (err) {
      const message =
        (err as { errors?: { message?: string }[] })?.errors?.[0]?.message ??
        "Couldn't verify that code. Want to try again?";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded) return;
    setFormError(null);
    setResentNotice(null);
    setResending(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
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
        Check your email
      </Text>
      <Text
        style={{
          ...typography.paragraphMd,
          color: colors.textSecondary,
          marginTop: spacing.s1,
        }}
      >
        We sent a {CODE_LENGTH}-digit code to {email}. Enter it below.
      </Text>

      <View style={{ marginTop: spacing.s5 }}>
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
          returnKeyType="go"
          onSubmitEditing={handleVerify}
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
            style={{
              ...typography.bodySm,
              color: colors.textMuted,
              marginTop: spacing.s1,
            }}
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
            color: "#e51d1d",
            textAlign: "center",
            marginBottom: spacing.s3,
          }}
        >
          {formError}
        </Text>
      ) : null}

      <Button
        label={submitting ? "Verifying…" : "Verify"}
        fullWidth
        disabled={!canSubmit}
        onPress={handleVerify}
      />
    </AuthLayout>
  );
}
