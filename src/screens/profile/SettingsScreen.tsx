import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { ChevronLeft, ChevronRight, LogOut, Palette as PaletteIcon } from "lucide-react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";
import type { ThemeMode } from "@/theme/themes";

import type { ProfileStackParamList } from "@/navigation/ProfileStack";

type Props = NativeStackScreenProps<ProfileStackParamList, "Settings">;

const MODE_CYCLE: ThemeMode[] = ["light", "flip", "dark"];

function nextMode(current: ThemeMode): ThemeMode {
  const i = MODE_CYCLE.indexOf(current);
  return MODE_CYCLE[(i + 1) % MODE_CYCLE.length];
}

function modeLabel(m: ThemeMode): string {
  return m === "light" ? "Light" : m === "flip" ? "Flip" : "Dark";
}

interface RowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  destructive?: boolean;
  onPress: () => void;
}

function Row({ icon, label, value, destructive, onPress }: RowProps) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);
  const labelColor = destructive ? palette.error : colors.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.s3,
        paddingVertical: spacing.s3,
        paddingHorizontal: spacing.s4,
        borderRadius: radius.sm,
        backgroundColor: pressed ? colors.surfaceSecondary : "transparent",
      }}
    >
      <View style={{ width: 24, alignItems: "center", justifyContent: "center" }}>{icon}</View>
      <Text style={{ ...typography.bodyLg, color: labelColor, flex: 1 }}>{label}</Text>
      {value ? (
        <Text style={{ ...typography.bodyMd, color: colors.textMuted }}>{value}</Text>
      ) : null}
      <ChevronRight size={18} color={colors.textMuted} />
    </Pressable>
  );
}

export function SettingsScreen({ navigation }: Props) {
  const { colors, mode, setMode } = useTheme();
  const { signOut } = useAuth();
  const { user } = useUser();

  const primaryEmail =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    "—";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.s2,
          paddingHorizontal: spacing.s3,
          paddingTop: spacing.s2,
          paddingBottom: spacing.s3,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={spacing.s3}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={{ padding: spacing.s1 }}
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingVertical: spacing.s3, gap: spacing.s5 }}>
        <Section title="Account">
          <View
            style={{
              paddingVertical: spacing.s3,
              paddingHorizontal: spacing.s4,
              gap: spacing.s1,
            }}
          >
            <Text style={{ ...typography.bodySm, color: colors.textMuted }}>
              Signed in as
            </Text>
            <Text style={{ ...typography.bodyLg, color: colors.textPrimary }}>{primaryEmail}</Text>
          </View>
        </Section>

        <Section title="Appearance">
          <Row
            icon={<PaletteIcon size={18} color={colors.textPrimary} />}
            label="Theme"
            value={modeLabel(mode)}
            onPress={() => setMode(nextMode(mode))}
          />
        </Section>

        <Section>
          <Row
            icon={<LogOut size={18} color={palette.error} />}
            label="Sign out"
            destructive
            onPress={() => signOut()}
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SectionProps {
  title?: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.s2 }}>
      {title ? (
        <Text
          style={{
            ...typography.overlineLg,
            color: colors.textMuted,
            paddingHorizontal: spacing.s4,
          }}
        >
          {title}
        </Text>
      ) : null}
      <View>{children}</View>
    </View>
  );
}
