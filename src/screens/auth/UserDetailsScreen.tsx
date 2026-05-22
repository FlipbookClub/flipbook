import { useState } from "react";
import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { OnboardingStackParamList } from "@/navigation/OnboardingStack";

type Props = NativeStackScreenProps<OnboardingStackParamList, "UserDetails">;

export function UserDetailsScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const firstTrimmed = firstName.trim();
  const lastTrimmed = lastName.trim();
  const canSubmit = firstTrimmed.length > 0 && lastTrimmed.length > 0;

  const handleContinue = () => {
    if (!canSubmit) return;
    navigation.navigate("GenrePreferences", {
      displayName: route.params.displayName,
      firstName: firstTrimmed,
      lastName: lastTrimmed,
    });
  };

  return (
    <AuthLayout>
      <View style={{ gap: spacing.s1 }}>
        <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>
          User details
        </Text>
        <Text style={{ ...typography.paragraphMd, color: colors.textSecondary }}>
          Enter your personal details to complete your account setup.
        </Text>
      </View>

      <View style={{ marginTop: spacing.s5, gap: spacing.s4 }}>
        <Input
          variant="underline"
          placeholder="First name"
          autoCapitalize="words"
          autoComplete="given-name"
          autoCorrect={false}
          value={firstName}
          onChangeText={setFirstName}
          returnKeyType="next"
        />
        <Input
          variant="underline"
          placeholder="Last name"
          autoCapitalize="words"
          autoComplete="family-name"
          autoCorrect={false}
          value={lastName}
          onChangeText={setLastName}
          returnKeyType="next"
          onSubmitEditing={handleContinue}
        />
      </View>

      <View style={{ flex: 1 }} />

      <Button label="Continue" fullWidth disabled={!canSubmit} onPress={handleContinue} />
    </AuthLayout>
  );
}
