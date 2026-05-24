import { useState } from "react";
import { Text, View } from "react-native";
import { useSignIn, useSignUp } from "@clerk/clerk-expo";
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

// Email-verification step. Two entry points:
//   1. signup flow — inserted between CreateAccount and the rest of onboarding;
//      uses useSignUp's attemptEmailAddressVerification.
//   2. signin flow — entered when SignInScreen detects an unverified account
//      (needs_first_factor + email_code); uses useSignIn's attemptFirstFactor.
// Both end with setActive on the resulting session. Not in Figma — visual
// style intentionally matches the other auth screens so it reads as part of
// the same flow.
export function VerifyEmailScreen({ route }: Props) {
  const { colors } = useTheme();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();
  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();
  const email = route.params.email;
  const flow = route.params.flow ?? "signup";
  const isLoaded = flow === "signin" ? signInLoaded : signUpLoaded;

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resentNotice, setResentNotice] = useState<string | null>(null);

  const canSubmit = isLoaded && code.length === CODE_LENGTH && !submitting;

  const handleVerify = async () => {
    if (!canSubmit) return;
    setFormError(null);
    setSubmitting(true);
    try {
      if (flow === "signin") {
        if (!signInLoaded || !signIn || !setActiveSignIn) return;
        const result = await signIn.attemptFirstFactor({ strategy: "email_code", code });
        if (result.status === "complete") {
          await setActiveSignIn({ session: result.createdSessionId });
        } else {
          setFormError("Verification incomplete. Check the code and try again.");
        }
      } else {
        if (!signUpLoaded || !signUp || !setActiveSignUp) return;
        const result = await signUp.attemptEmailAddressVerification({ code });
        if (result.status === "complete") {
          await setActiveSignUp({ session: result.createdSessionId });
          // RootNavigator (TASK-021) will route to profile-setup since no Convex user yet.
        } else {
          setFormError("Verification incomplete. Check the code and try again.");
        }
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
    setFormError(null);
    setResentNotice(null);
    setResending(true);
    try {
      if (flow === "signin") {
        if (!signInLoaded || !signIn) return;
        // Re-derive the email_code factor's emailAddressId from the in-flight
        // sign-in attempt. SignInScreen already kicked off prepareFirstFactor
        // once; this is just the resend path.
        const factor = signIn.supportedFirstFactors?.find(
          (f): f is typeof f & { emailAddressId: string } =>
            f.strategy === "email_code" && "emailAddressId" in f,
        );
        if (!factor) {
          setFormError("Couldn't resend — try going back and signing in again.");
          return;
        }
        await signIn.prepareFirstFactor({ strategy: "email_code", emailAddressId: factor.emailAddressId });
      } else {
        if (!signUpLoaded || !signUp) return;
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      }
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
