import { useRef, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";
import { storage } from "@/lib/storage";

export const ONBOARDING_SEEN_KEY = "onboarding.educationSeen";

const SLIDES = [
  {
    emoji: "📖",
    heading: "Read alongside everyone",
    body: "Join a club, open the book, and read at your own pace. The room is right there with you.",
  },
  {
    emoji: "💬",
    heading: "React on the page",
    body: "Long-press any page to drop a reaction or comment. Other members see it right where you left it.",
  },
  {
    emoji: "✨",
    heading: "Stay with the club",
    body: "See where everyone is in the book — no pressure, just a gentle nudge to keep reading together.",
  },
];

interface OnboardingModalProps {
  onDismiss?: () => void;
}

export function OnboardingModal({ onDismiss }: OnboardingModalProps) {
  const { colors } = useTheme();
  const ref = useRef<BottomSheetModal>(null);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    // Small delay so the sheet doesn't pop before the main screen renders.
    const t = setTimeout(() => ref.current?.present(), 600);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    storage.set(ONBOARDING_SEEN_KEY, "1");
    ref.current?.dismiss();
    onDismiss?.();
  };

  const isLast = slide === SLIDES.length - 1;
  const current = SLIDES[slide];

  return (
    <BottomSheet ref={ref} snapPoints={["55%"]} onDismiss={handleDismiss}>
      <View style={{ flex: 1, gap: spacing.s5, paddingTop: spacing.s2 }}>
        {/* Slide content */}
        <View style={{ alignItems: "center", gap: spacing.s3 }}>
          <Text style={{ fontSize: 48, lineHeight: 56 }}>{current.emoji}</Text>
          <Text
            style={{
              ...typography.headingMd,
              color: colors.textPrimary,
              textAlign: "center",
            }}
          >
            {current.heading}
          </Text>
          <Text
            style={{
              ...typography.paragraphMd,
              color: colors.textSecondary,
              textAlign: "center",
            }}
          >
            {current.body}
          </Text>
        </View>

        {/* Dot indicators */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: spacing.s2 }}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === slide ? 20 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === slide ? palette.accent : colors.border,
              }}
            />
          ))}
        </View>

        {/* CTAs */}
        <View style={{ gap: spacing.s2 }}>
          {isLast ? (
            <Button label="Got it" fullWidth onPress={handleDismiss} />
          ) : (
            <>
              <Button
                label="Next"
                fullWidth
                onPress={() => setSlide((s) => s + 1)}
              />
              <Pressable
                onPress={handleDismiss}
                style={{ alignItems: "center", paddingVertical: spacing.s2 }}
                accessibilityRole="button"
              >
                <Text style={{ ...typography.bodyMd, color: colors.textMuted }}>
                  Skip
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </BottomSheet>
  );
}
