import { type ReactNode } from "react";
import { View, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { useTheme } from "@/theme/ThemeContext";

interface ScreenContainerProps {
  children: ReactNode;
  // Which edges to inset (defaults: all four). Pass e.g. ["top"] for a screen
  // whose bottom is handled by a tab bar, or [] to opt out of all insets.
  edges?: Edge[];
  style?: ViewStyle;
}

// Single safe-area wrapper used by every screen. Replaces the pattern of
// importing SafeAreaView from "react-native" (RN core's version is a no-op
// on Android under edgeToEdgeEnabled — content bleeds into the status bar and
// gesture-nav area). This one uses react-native-safe-area-context, which reads
// the actual insets provided by the OS and applies them correctly on both
// platforms regardless of the edge-to-edge setting.
export function ScreenContainer({
  children,
  edges = ["top", "bottom", "left", "right"],
  style,
}: ScreenContainerProps) {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[{ flex: 1, backgroundColor: colors.surfacePrimary }, style]}
    >
      {children}
    </SafeAreaView>
  );
}

// Lightweight inset-only wrapper for cases where you need the safe-area
// padding applied to an inner View rather than the root (e.g. inside a
// modal sheet that already manages its own background).
export function SafeView({
  children,
  edges = ["top", "bottom", "left", "right"],
  style,
}: ScreenContainerProps) {
  const { colors } = useTheme();
  return (
    <View style={[{ flex: 1, backgroundColor: colors.surfacePrimary }, style]}>
      <SafeAreaView
        edges={edges}
        style={{ flex: 1 }}
      >
        {children}
      </SafeAreaView>
    </View>
  );
}
