import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/clerk-expo";
import { NavigationContainer, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { ActivityIndicator, Text, View } from "react-native";

import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { OnboardingStack } from "./OnboardingStack";
import { getInitialURL, linkingConfig, linkingPrefixes, subscribeToURL } from "@/lib/deeplinks";
import { usePushTokenRegistration } from "@/lib/notifications";
import { useReactionQueueFlush } from "@/lib/useReactionQueueFlush";
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

  // TEMP DIAGNOSTIC (remove after the prod white-screen is solved): release
  // builds expose no JS console, so when Clerk's `isLoaded` stalls we surface
  // the cause on-screen — whether the env vars are present and whether the app
  // can actually reach Clerk + Convex from inside the release runtime.
  const [slow, setSlow] = useState(false);
  const [probe, setProbe] = useState<string>("probing…");
  useEffect(() => {
    if (isLoaded) return;
    const t = setTimeout(() => {
      setSlow(true);
      const clerkUrl = "https://clerk.useflipbook.com/v1/environment";
      const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
      Promise.allSettled([
        fetch(clerkUrl).then((r) => `clerk ${r.status}`),
        convexUrl ? fetch(convexUrl).then((r) => `convex ${r.status}`) : Promise.resolve("convex URL MISSING"),
      ]).then(([c, x]) => {
        const fmt = (r: PromiseSettledResult<string>) =>
          r.status === "fulfilled" ? r.value : `FAIL ${String((r as PromiseRejectedResult).reason).slice(0, 80)}`;
        setProbe(`${fmt(c)} | ${fmt(x)}`);
      });
    }, 6000);
    return () => clearTimeout(t);
  }, [isLoaded]);

  // FR-028: register a push token once an onboarded user exists. Permission
  // prompt fires here (post-onboarding) rather than at first sign-in.
  usePushTokenRegistration(me != null);

  // FR-013 / FR-016 edge case: drain the offline reaction queue when network
  // returns. Idempotent — only runs when there are queued items.
  useReactionQueueFlush();

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
    content =
      slow ? (
        <DiagnosticSplash
          colorBg={colors.surfacePrimary}
          colorFg={colors.textPrimary}
          hasClerkKey={!!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
          hasConvexUrl={!!process.env.EXPO_PUBLIC_CONVEX_URL}
          probe={probe}
        />
      ) : (
        <Splash colorBg={colors.surfacePrimary} colorFg={colors.textPrimary} />
      );
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
      linking={{
        prefixes: linkingPrefixes,
        config: linkingConfig,
        // TASK-089: combine OS deep links with push-notification taps so
        // cold-launches from a notification route to the right screen.
        getInitialURL,
        subscribe: subscribeToURL,
      }}
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

// TEMP DIAGNOSTIC — shows why auth-loading stalled, on-screen (release builds
// have no JS console). Remove once the prod white-screen is resolved.
function DiagnosticSplash({
  colorBg,
  colorFg,
  hasClerkKey,
  hasConvexUrl,
  probe,
}: {
  colorBg: string;
  colorFg: string;
  hasClerkKey: boolean;
  hasConvexUrl: boolean;
  probe: string;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: colorBg, alignItems: "center", justifyContent: "center", padding: 24, gap: 10 }}>
      <Text style={{ color: colorFg, fontSize: 16, fontWeight: "700", textAlign: "center" }}>
        Still loading… (diagnostic)
      </Text>
      <Text style={{ color: colorFg, fontSize: 13, textAlign: "center" }}>
        Clerk loaded: no{"\n"}
        Clerk key present: {hasClerkKey ? "yes" : "NO"}{"\n"}
        Convex URL present: {hasConvexUrl ? "yes" : "NO"}{"\n"}
        Reachability: {probe}
      </Text>
    </View>
  );
}
