import { useQuery } from "convex/react";
import { useAuth } from "@clerk/clerk-expo";
import { NavigationContainer, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";

import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { OnboardingStack } from "./OnboardingStack";
import { linkingConfig, linkingPrefixes } from "@/lib/deeplinks";
import { useTheme } from "@/theme/ThemeContext";
import { api } from "../../convex/_generated/api";

// Auth-routing gate. Full implementation per PRD § Auth Implementation lands
// in TASK-021; this is the minimal version that unblocks the "session already
// exists" loop by routing signed-in users away from AuthStack.
//
//   isLoaded=false              → splash spinner
//   !isSignedIn                 → AuthStack (Welcome / Create / SignIn / Verify)
//   isSignedIn + me === undefined → splash (Convex query in flight)
//   isSignedIn + me === null    → OnboardingStack (no `users` row yet)
//   isSignedIn + me             → MainTabs
export function RootNavigator() {
  const { mode, colors } = useTheme();
  const { isLoaded, isSignedIn } = useAuth();
  // Only run users.me once Clerk has authenticated — otherwise the query gets
  // an unauthenticated identity and throws. "skip" is Convex's documented way
  // to defer a query until inputs are ready.
  const me = useQuery(api.users.me, isLoaded && isSignedIn ? {} : "skip");

  const navTheme = {
    ...(mode === "light" ? DefaultTheme : DarkTheme),
    colors: {
      ...(mode === "light" ? DefaultTheme.colors : DarkTheme.colors),
      background: colors.surfacePrimary,
      card: colors.surfaceElevated,
      text: colors.textPrimary,
      border: colors.border,
      primary: colors.textPrimary,
    },
  };

  let content;
  if (!isLoaded) {
    content = <Splash colorBg={colors.surfacePrimary} colorFg={colors.textPrimary} />;
  } else if (!isSignedIn) {
    content = <AuthStack />;
  } else if (me === undefined) {
    content = <Splash colorBg={colors.surfacePrimary} colorFg={colors.textPrimary} />;
  } else if (me === null) {
    content = <OnboardingStack />;
  } else {
    content = <MainTabs />;
  }

  return (
    <NavigationContainer
      theme={navTheme}
      linking={{ prefixes: linkingPrefixes, config: linkingConfig }}
    >
      {content}
    </NavigationContainer>
  );
}

function Splash({ colorBg, colorFg }: { colorBg: string; colorFg: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: colorBg, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={colorFg} />
    </View>
  );
}
