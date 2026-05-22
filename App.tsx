import "./global.css";

import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_700Bold,
  useFonts,
} from "@expo-google-fonts/raleway";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import { View } from "react-native";

// Closes the in-app browser when the OAuth redirect returns. Required for
// Clerk's `useSSO()` flow (Apple/Google) to complete properly in Expo Go and
// dev builds. Safe to call at module scope — no-op outside of OAuth flows.
WebBrowser.maybeCompleteAuthSession();
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { RootNavigator } from "@/navigation/RootNavigator";
import { CLERK_PUBLISHABLE_KEY, tokenCache } from "@/lib/clerk";
import { convex } from "@/lib/convex";
import { palette } from "@/theme/palette";
import { ThemeProvider, useTheme } from "@/theme/ThemeContext";

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error(
    "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Add it to .env.local from your Clerk dashboard.",
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    "Raleway-Medium": Raleway_500Medium,
    "Raleway-SemiBold": Raleway_600SemiBold,
    "Raleway-Bold": Raleway_700Bold,
    "Inter-Regular": Inter_400Regular,
    "Inter-Medium": Inter_500Medium,
    "Inter-SemiBold": Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: palette.surfaceWarm }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <ThemeProvider>
              <BottomSheetModalProvider>
                <ThemedShell />
              </BottomSheetModalProvider>
            </ThemeProvider>
          </ConvexProviderWithClerk>
        </ClerkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedShell() {
  const { mode } = useTheme();
  // Light wants dark icons in the status bar; Flip + Dark want light.
  const statusBarStyle = mode === "light" ? "dark" : "light";

  return (
    <>
      <StatusBar style={statusBarStyle} />
      <RootNavigator />
    </>
  );
}
