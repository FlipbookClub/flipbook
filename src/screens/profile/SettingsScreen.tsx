import { useEffect, useState } from "react";
import { Alert, Linking, Platform, Pressable, SafeAreaView, ScrollView, Switch, Text, View } from "react-native";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LogOut,
  Trash2,
} from "@/lib/icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ThemePicker } from "@/components/features/ThemePicker";

import { api } from "../../../convex/_generated/api";

import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";
import type { ProfileStackParamList } from "@/navigation/ProfileStack";

type Props = NativeStackScreenProps<ProfileStackParamList, "Settings">;

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
  const { colors } = useTheme();
  const { signOut } = useAuth();
  const { user } = useUser();
  const deleteSelf = useMutation(api.users.deleteSelf);
  const me = useQuery(api.users.me);
  const updateNotificationPrefs = useMutation(api.users.updateNotificationPrefs);

  // Local mirror so toggles flip instantly; sync to server in the background.
  // Defaults to "all on" when the user has never visited Settings (matches
  // server-side opt-in default).
  const [chapterDrops, setChapterDrops] = useState(true);
  const [reactionReplies, setReactionReplies] = useState(true);
  useEffect(() => {
    if (me?.notificationPrefs) {
      setChapterDrops(me.notificationPrefs.chapterDrops);
      setReactionReplies(me.notificationPrefs.reactionReplies);
    }
  }, [me?.notificationPrefs]);

  const persistPrefs = (next: { chapterDrops: boolean; reactionReplies: boolean }) => {
    updateNotificationPrefs({ prefs: next }).catch(() => undefined);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete account?",
      "This wipes your profile, memberships, reactions, and reading progress. It can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSelf();
              try {
                await user?.delete();
              } catch {
                // If Clerk delete fails (network, etc.) the Convex side is
                // already gone — fall back to signOut so the user lands on
                // a fresh state. They can re-attempt the Clerk delete later.
              }
              await signOut();
            } catch (err) {
              const code = (err as { data?: { code?: string } })?.data?.code;
              if (code === "moderator_blocks_delete") {
                Alert.alert(
                  "Hand off your clubs first",
                  "You moderate one or more communities. Delete or transfer them, then try again.",
                );
              } else {
                Alert.alert("Couldn't delete account", "Try again in a moment.");
              }
            }
          },
        },
      ],
    );
  };

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
          <ThemePicker />
        </Section>

        <Section title="Notifications">
          <ToggleRow
            icon={<Bell size={18} color={colors.textPrimary} />}
            label="Chapter drops"
            sublabel="Pushes when an author you follow publishes a new chapter."
            value={chapterDrops}
            onChange={(v) => {
              setChapterDrops(v);
              persistPrefs({ chapterDrops: v, reactionReplies });
            }}
          />
          <ToggleRow
            icon={<Bell size={18} color={colors.textPrimary} />}
            label="Reaction replies"
            sublabel="Pushes when someone replies to your reaction."
            value={reactionReplies}
            onChange={(v) => {
              setReactionReplies(v);
              persistPrefs({ chapterDrops, reactionReplies: v });
            }}
          />
        </Section>

        <Section title="Subscription">
          <Row
            icon={<CreditCard size={18} color={colors.textPrimary} />}
            label="Manage subscription"
            onPress={() => {
              // FR-026 / Edge-case: opens the OS-native subscription manager.
              // Works for users who have an active Pro subscription (and is a
              // no-op for users who never subscribed — they just see the
              // empty subscriptions screen).
              const url =
                Platform.OS === "ios"
                  ? "https://apps.apple.com/account/subscriptions"
                  : "https://play.google.com/store/account/subscriptions";
              Linking.openURL(url).catch(() => undefined);
            }}
          />
        </Section>

        <Section>
          <Row
            icon={<LogOut size={18} color={colors.textPrimary} />}
            label="Sign out"
            onPress={() => signOut()}
          />
          <Row
            icon={<Trash2 size={18} color={palette.error} />}
            label="Delete account"
            destructive
            onPress={handleDeleteAccount}
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

interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  value: boolean;
  onChange: (next: boolean) => void;
}

function ToggleRow({ icon, label, sublabel, value, onChange }: ToggleRowProps) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.s3,
        paddingVertical: spacing.s3,
        paddingHorizontal: spacing.s4,
      }}
    >
      <View style={{ width: 24, alignItems: "center", justifyContent: "center" }}>{icon}</View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ ...typography.bodyLg, color: colors.textPrimary }}>{label}</Text>
        {sublabel ? (
          <Text style={{ ...typography.bodySm, color: colors.textMuted }}>{sublabel}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: palette.brandPrimary, false: colors.border }}
        thumbColor={palette.textOnBrand}
        accessibilityLabel={label}
      />
    </View>
  );
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
