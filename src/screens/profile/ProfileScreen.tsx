import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { Settings } from "lucide-react-native";
import { useQuery } from "convex/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { ProfileStackParamList } from "@/navigation/ProfileStack";
import { api } from "../../../convex/_generated/api";

type Props = NativeStackScreenProps<ProfileStackParamList, "Profile">;

// Stub profile screen — stats are hardcoded placeholders until the clubs +
// reading-progress features ship (TASK-024+ and TASK-042+). Real avatar
// upload lands in TASK-022b / Phase 7. For now we render initials.
export function ProfileScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const me = useQuery(api.users.me);

  const displayName = me?.displayName ?? "";
  const fullName = me ? `${me.firstName} ${me.lastName}`.trim() : "";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.s4,
          paddingTop: spacing.s2,
          paddingBottom: spacing.s3,
        }}
      >
        <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>Profile</Text>
        <Pressable
          onPress={() => navigation.navigate("Settings")}
          hitSlop={spacing.s3}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Settings size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.s5, gap: spacing.s5 }}>
        <View style={{ alignItems: "center", gap: spacing.s3 }}>
          <Avatar name={fullName || displayName || "?"} imageUri={me?.avatarUrl} size="xl" />
          <View style={{ alignItems: "center", gap: spacing.s1 }}>
            <Text style={{ ...typography.headingLg, color: colors.textPrimary }}>
              {displayName || "—"}
            </Text>
            {fullName ? (
              <Text style={{ ...typography.bodyMd, color: colors.textMuted }}>{fullName}</Text>
            ) : null}
          </View>
          {me?.bio ? (
            <Text
              style={{
                ...typography.paragraphMd,
                color: colors.textSecondary,
                textAlign: "center",
                marginTop: spacing.s2,
              }}
            >
              {me.bio}
            </Text>
          ) : null}
        </View>

        <View style={{ flexDirection: "row", gap: spacing.s3 }}>
          <Card style={{ flex: 1 }}>
            <View style={{ alignItems: "center", gap: spacing.s1, paddingVertical: spacing.s2 }}>
              <Text style={{ ...typography.displayMd, color: colors.textPrimary }}>0</Text>
              <Text style={{ ...typography.bodySm, color: colors.textMuted }}>Clubs</Text>
            </View>
          </Card>
          <Card style={{ flex: 1 }}>
            <View style={{ alignItems: "center", gap: spacing.s1, paddingVertical: spacing.s2 }}>
              <Text style={{ ...typography.displayMd, color: colors.textPrimary }}>0</Text>
              <Text style={{ ...typography.bodySm, color: colors.textMuted }}>Books read</Text>
            </View>
          </Card>
        </View>

        {me?.genres && me.genres.length > 0 ? (
          <View style={{ gap: spacing.s2 }}>
            <Text
              style={{
                ...typography.overlineLg,
                color: colors.textMuted,
              }}
            >
              Genres
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.s2 }}>
              {me.genres.map((g) => (
                <View
                  key={g}
                  style={{
                    paddingVertical: spacing.s1,
                    paddingHorizontal: spacing.s3,
                    borderRadius: 9999,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ ...typography.uiLabelMd, color: colors.textPrimary }}>{g}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
