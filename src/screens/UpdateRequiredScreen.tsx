import { Linking, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { captureException } from "@/lib/monitoring";
import { spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

interface UpdateRequiredScreenProps {
  // From the appConfig row in Convex. No update link is ever written in code.
  updateUrl: string | null;
}

// S0-2. Shown by RootNavigator in place of the whole app when the installed
// version is below the minimum for this platform. v1 components and theme
// only; this ships in a v1 build. Copy is fixed by the Sprint 0 spec.
export function UpdateRequiredScreen({ updateUrl }: UpdateRequiredScreenProps) {
  const { colors } = useTheme();

  const handleUpdate = () => {
    // The gate never shows this screen without a link (resolveVersionGate),
    // so this is belt and braces: with nothing to open, do nothing.
    if (!updateUrl) return;
    Linking.openURL(updateUrl).catch((error) => {
      captureException(error, { where: "UpdateRequiredScreen.openURL" });
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: spacing.s5,
          gap: spacing.s4,
        }}
      >
        <Wordmark size={32} />
        <Text
          accessibilityRole="header"
          style={{
            ...typography.headingLg,
            color: colors.textPrimary,
            textAlign: "center",
            marginTop: spacing.s5,
          }}
        >
          A new version of Flipbook is ready
        </Text>
        <Text style={{ ...typography.bodyLg, color: colors.textSecondary, textAlign: "center" }}>
          Update to keep reading. Your books, clubs and reactions are all where you left them.
        </Text>
      </View>
      <View style={{ paddingHorizontal: spacing.s5, paddingBottom: spacing.s5 }}>
        <Button label="Update" size="lg" fullWidth onPress={handleUpdate} />
      </View>
    </SafeAreaView>
  );
}
