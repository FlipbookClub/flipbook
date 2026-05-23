import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { CloudOff } from "lucide-react-native";

import { useConnectivity } from "@/lib/connectivity";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

// Slim banner pinned just below the status bar. Slides in when offline, out
// when reconnected. Quiet styling — informs without alarming (Brand voice
// anti-pattern: don't be loud about transient state).
export function OfflineBanner() {
  const { colors } = useTheme();
  const { isOnline, isReady } = useConnectivity();
  const reduceMotion = useReducedMotion();
  const translateY = useSharedValue(reduceMotion ? 0 : -40);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!isReady) return;
    // FR-083: when Reduce Motion is on, no slide — just opacity in/out.
    if (!reduceMotion) {
      const target = isOnline ? -40 : 0;
      translateY.value = withTiming(target, { duration: 200 });
    } else {
      translateY.value = 0;
    }
    opacity.value = withTiming(isOnline ? 0 : 1, { duration: 200 });
  }, [isOnline, isReady, translateY, opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          paddingTop: spacing.s6,
          paddingHorizontal: spacing.s4,
          paddingBottom: spacing.s2,
          backgroundColor: colors.surfaceElevated,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        animatedStyle,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.s2 }}>
        <CloudOff size={16} color={palette.warning} />
        <Text style={{ ...typography.bodySm, color: colors.textPrimary, flex: 1 }}>
          Offline — your reactions will sync when you're back.
        </Text>
      </View>
    </Animated.View>
  );
}
