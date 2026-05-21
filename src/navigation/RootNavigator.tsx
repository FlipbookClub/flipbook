import { NavigationContainer, DarkTheme, DefaultTheme } from "@react-navigation/native";

import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { useTheme } from "@/theme/ThemeContext";

// Hardcoded for TASK-009 — auth gate wires up in TASK-021 once Clerk + Convex
// users.me are live. Flip to true locally to preview MainTabs.
const PLACEHOLDER_IS_SIGNED_IN = true;

export function RootNavigator() {
  const { mode, colors } = useTheme();

  const navTheme = {
    ...(mode === "light" ? DefaultTheme : DarkTheme),
    colors: {
      ...(mode === "light" ? DefaultTheme.colors : DarkTheme.colors),
      background: colors.surfaceSecondary,
      card: colors.surfaceElevated,
      text: colors.textPrimary,
      border: colors.border,
      primary: colors.textPrimary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      {PLACEHOLDER_IS_SIGNED_IN ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
