import { useRef } from "react";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tag } from "@/components/ui/Tag";
import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { themes, type ThemeMode } from "@/theme/themes";
import { typography } from "@/theme/typography";

const MODES: ThemeMode[] = ["light", "flip", "dark"];

// Dev-only design system preview for TASK-010 / TASK-011 verification.
// Toggle through Light / Flip / Dark and confirm tokens render correctly.
export function DesignSystemPreview() {
  const { colors, mode, setMode } = useTheme();
  const sheetRef = useRef<BottomSheetModal>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfaceSecondary }}>
      <ScrollView contentContainerStyle={{ padding: spacing.s5, gap: spacing.s5 }}>
        <View style={{ gap: spacing.s2 }}>
          <Text style={{ ...typography.headingLg, color: colors.textPrimary }}>
            Design System
          </Text>
          <Text style={{ ...typography.bodyMd, color: colors.textSecondary }}>
            Mode: <Text style={{ ...typography.bodyMd, color: palette.accentStrong }}>{mode}</Text>
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: spacing.s2 }}>
          {MODES.map((option) => {
            const selected = option === mode;
            return (
              <Pressable
                key={option}
                onPress={() => setMode(option)}
                style={{
                  paddingVertical: spacing.s2,
                  paddingHorizontal: spacing.s4,
                  borderRadius: radius.sm,
                  borderWidth: selected ? 2 : 1,
                  borderColor: selected ? palette.accentStrong : colors.border,
                  backgroundColor: themes[option].surfacePrimary,
                }}
              >
                <Text
                  style={{
                    ...typography.uiLabelMd,
                    color: themes[option].textPrimary,
                  }}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Section title="Buttons">
          <View style={{ gap: spacing.s3 }}>
            <View style={{ flexDirection: "row", gap: spacing.s2, flexWrap: "wrap" }}>
              <Button label="Primary sm" size="sm" />
              <Button label="Primary md" />
              <Button label="Primary lg" size="lg" />
            </View>
            <View style={{ flexDirection: "row", gap: spacing.s2, flexWrap: "wrap" }}>
              <Button label="Secondary" variant="secondary" />
              <Button label="Disabled" disabled />
              <Button label="Text alt" variant="alt" />
            </View>
          </View>
        </Section>

        <Section title="Cards">
          <Card>
            <Text style={{ ...typography.bodyLg, color: colors.textPrimary }}>
              Elevated card with theme-aware shadow.
            </Text>
          </Card>
        </Section>

        <Section title="Inputs">
          <View style={{ gap: spacing.s3 }}>
            <Input label="Display name" placeholder="@moks" />
            <Input label="Email" helperText="Used for sign-in" placeholder="you@flipbook.app" />
            <Input
              label="Password"
              placeholder="********"
              errorText="Must contain a number"
              secureTextEntry
            />
          </View>
        </Section>

        <Section title="Tags">
          <View style={{ flexDirection: "row", gap: spacing.s2, flexWrap: "wrap" }}>
            <Tag label="Member" />
            <Tag label="Moderator" variant="outlined" />
            <Tag label="Beta reader" />
          </View>
        </Section>

        <Section title="Avatars">
          <View style={{ flexDirection: "row", gap: spacing.s3, alignItems: "center" }}>
            <Avatar name="Maya" size="sm" />
            <Avatar name="Moks O" size="md" />
            <Avatar name="Indie Author" size="lg" />
            <Avatar name="Beta Tester" size="xl" />
          </View>
        </Section>

        <Section title="Skeleton">
          <View style={{ gap: spacing.s2 }}>
            <Skeleton height={20} />
            <Skeleton height={20} width="80%" />
            <Skeleton height={20} width="60%" />
          </View>
        </Section>

        <Section title="Bottom sheet">
          <Button
            label="Open sheet"
            variant="secondary"
            onPress={() => sheetRef.current?.present()}
          />
        </Section>
      </ScrollView>

      <BottomSheet ref={sheetRef}>
        <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>
          Bottom sheet
        </Text>
        <Text
          style={{
            ...typography.bodyMd,
            color: colors.textSecondary,
            marginTop: spacing.s2,
          }}
        >
          Used for reaction details, settings overflow, etc.
        </Text>
      </BottomSheet>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.s3 }}>
      <Text style={{ ...typography.overlineLg, color: colors.textMuted }}>{title}</Text>
      {children}
    </View>
  );
}
