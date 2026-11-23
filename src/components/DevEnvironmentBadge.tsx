import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isDevelopmentVariant } from "@/lib/appVariant";
import { CLERK_PUBLISHABLE_KEY } from "@/lib/clerk";
import { describeDevEnvironment, devEnvironmentLabel } from "@/lib/devEnvironment";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

// S0-9. A small line at the bottom of every screen in Flipbook Dev, saying
// which environment and Clerk instance it is using. Never rendered in tester
// or store builds (src/lib/appVariant.ts). Doesn't take touches.
//
// The Maestro smoke flow reads it (testID dev.environmentBadge) and stops
// unless it says "development" and "Clerk test".
export function DevEnvironmentBadge() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  if (!isDevelopmentVariant()) return null;
  const label = devEnvironmentLabel(
    describeDevEnvironment(process.env.EXPO_PUBLIC_ENV, CLERK_PUBLISHABLE_KEY),
  );
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 8,
        bottom: Math.max(insets.bottom - 14, 2),
      }}
    >
      <Text
        testID="dev.environmentBadge"
        accessibilityLabel={label}
        style={{ ...typography.bodySm, fontSize: 10, color: colors.textMuted, opacity: 0.8 }}
      >
        {label}
      </Text>
    </View>
  );
}
