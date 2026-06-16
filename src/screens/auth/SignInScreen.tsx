import { useState } from "react";
import { Text, View } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
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

type Props = NativeStackScreenProps<AuthStackParamList, "SignIn">;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignInScreen({ navigation }: Props) {
  const { colors, mode } = useTheme();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { startFlow, providerInFlight, error: socialError } = useSocialAuth();

  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const emailError =
    emailTouched && email.trim().length > 0 && !EMAIL_RE.test(email.trim())
      ? "That doesn't look like an email address."
      : null;

  // Link color matches the wordmark accent per mode — coral in Light/Flip,
  // GoldenSand in Dark (see WelcomeScreen for the same rationale).
  const linkColor = mode === "dark" ? palette.highlight : palette.accent;
  const canSubmit = isLoaded && EMAIL_RE.test(email.trim()) && password.length > 0 && !submitting;

  const handleSignIn = async () => {
    if (!isLoaded || !canSubmit) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const attempt = await signIn.create({ identifier: email.trim(), password });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        // RootNavigator's auth gate (TASK-021) will route forward on signed-in.
        return;
      }
      // Most common non-complete: the account exists but its email was never
      // verified. Clerk returns needs_first_factor with email_code as a
      // supported strategy. Auto-trigger the code send and route to the
      // verification screen in signin mode.
      if (attempt.status === "needs_first_factor") {
        const factor = attempt.supportedFirstFactors?.find(
          (f): f is typeof f & { emailAddressId: string } =>
            f.strategy === "email_code" && "emailAddressId" in f,
        );
        if (factor) {
          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: factor.emailAddressId,
          });
          navigation.navigate("VerifyEmail", { email: email.trim(), flow: "signin" });
          return;
        }
      }
      // Attack Protection: a password sign-in from a NEW device returns
      // needs_client_trust. Clerk emails a one-time code that must be verified
      // (as a second factor) to finish signing in. Route to the shared code
      // screen in client_trust mode rather than dead-ending on an error.
      // `needs_client_trust` is returned at runtime by Clerk's Attack Protection,
      // but this @clerk/types version's SignInStatus union doesn't include it yet
      // — compare as a string so TS doesn't flag the (real) status as impossible.
      if ((attempt.status as string) === "needs_client_trust") {
        const emailFactor = attempt.supportedSecondFactors?.find(
          (f) => f.strategy === "email_code",
        );
        if (emailFactor) {
          await signIn.prepareSecondFactor({ strategy: "email_code" });
          navigation.navigate("VerifyEmail", { email: email.trim(), flow: "client_trust" });
          return;
        }
      }
      setFormError(`Sign-in incomplete (${attempt.status}). Try again or contact support.`);
    } catch (err) {
      // Clerk reports session_exists when a valid session is still cached
      // (e.g. after a network blip the RN side hadn't reconciled with Clerk's
      // internal state yet). The user IS signed in — RootNavigator's auth
      // gate will route them forward as soon as useAuth() catches up, so
      // swallow this rather than showing a scary error.
      const errors = (err as { errors?: { code?: string; message?: string }[] })?.errors;
      const code = errors?.[0]?.code;
      if (code === "session_exists") {
        setFormError(null);
        return;
      }
      setFormError(errors?.[0]?.message ?? "Sign-in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApple = () => startFlow("oauth_apple");
  const handleGoogle = () => startFlow("oauth_google");

  return (
    <AuthLayout>
      <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>
        Sign in to your account
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
          onBlur={() => setEmailTouched(true)}
          errorText={emailError ?? undefined}
          returnKeyType="next"
        />
        <Input
          variant="underline"
          placeholder="Password"
          autoCapitalize="none"
          autoComplete="password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          returnKeyType="go"
          onSubmitEditing={handleSignIn}
        />
      </View>

      <Text
        onPress={() => navigation.navigate("ForgotPassword")}
        style={{
          ...typography.bodySm,
          color: linkColor,
          fontFamily: "Raleway-SemiBold",
          textAlign: "right",
          marginTop: spacing.s2,
        }}
      >
        Forgot password?
      </Text>

      <View style={{ marginTop: spacing.s5, gap: spacing.s3 }}>
        <Text
          style={{ ...typography.bodyMd, color: colors.textMuted, textAlign: "center" }}
        >
          or
        </Text>
        <AppleAuthButton
          label="Continue with Apple"
          onPress={handleApple}
          disabled={providerInFlight !== null}
        />
        <GoogleAuthButton
          label="Continue with Google"
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
          New to Flipbook?{" "}
          <Text
            onPress={() => navigation.navigate("CreateAccount")}
            style={{
              ...typography.bodyMd,
              color: linkColor,
              fontFamily: "Raleway-SemiBold",
            }}
          >
            Sign up here
          </Text>
        </Text>
        <Button
          label={submitting ? "Signing in…" : "Sign in"}
          fullWidth
          disabled={!canSubmit}
          onPress={handleSignIn}
        />
      </View>
    </AuthLayout>
  );
}
