import { useState, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { ChevronLeft, Moon, Sparkles, Sun } from "lucide-react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";

import { Wordmark } from "@/components/ui/Wordmark";
import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";
import type { ThemeMode } from "@/theme/themes";

const MODE_CYCLE: ThemeMode[] = ["light", "flip", "dark"];

function nextMode(current: ThemeMode): ThemeMode {
  const i = MODE_CYCLE.indexOf(current);
  return MODE_CYCLE[(i + 1) % MODE_CYCLE.length];
}

// Shared chrome for every auth screen: surfacePrimary background, keyboard
// avoidance, top bar with the Flipbook wordmark on the left and a tappable
// mode-cycle icon on the right (Sun → Sparkles → Moon → ...). The wordmark +
// toggle pattern is in every Figma sign-up frame on page 35:1124.
//
// If the screen is nested in a stack and has a previous route, we render a
// back chevron over the wordmark so users can step back through onboarding.
// Sign-out button (visible only when signed in) lives in the bottom slot —
// big enough to tap comfortably and styled as a real secondary action.
export function AuthLayout({ children }: { children: ReactNode }) {
  const { colors, mode, setMode } = useTheme();
  const { isSignedIn, signOut } = useAuth();
  const navigation = useNavigation();
  const [signOutPressed, setSignOutPressed] = useState(false);
  const ModeIcon = mode === "dark" ? Moon : mode === "flip" ? Sparkles : Sun;
  const canGoBack = navigation.canGoBack();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: spacing.s4,
            paddingTop: spacing.s4,
            paddingBottom: spacing.s5,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 32,
            }}
          >
            {canGoBack ? (
              <Pressable
                onPress={() => navigation.goBack()}
                hitSlop={spacing.s3}
                accessibilityRole="button"
                accessibilityLabel="Back"
                style={{ padding: spacing.s1 }}
              >
                <ChevronLeft size={26} color={colors.textPrimary} />
              </Pressable>
            ) : (
              <Wordmark size={32} />
            )}
            <Pressable
              onPress={() => setMode(nextMode(mode))}
              hitSlop={spacing.s3}
              accessibilityRole="button"
              accessibilityLabel="Change theme"
            >
              <ModeIcon size={20} color={colors.textPrimary} />
            </Pressable>
          </View>
          <View style={{ flex: 1, marginTop: spacing.s7 }}>{children}</View>
          {isSignedIn ? (
            <Pressable
              onPress={() => signOut()}
              onPressIn={() => setSignOutPressed(true)}
              onPressOut={() => setSignOutPressed(false)}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              style={{
                alignSelf: "stretch",
                marginTop: spacing.s3,
                height: 44,
                borderRadius: radius.sm,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: signOutPressed ? colors.surfaceSecondary : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  ...typography.bodyMd,
                  fontFamily: "Raleway-SemiBold",
                  color: palette.error,
                }}
              >
                Sign out
              </Text>
            </Pressable>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
