import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "@/lib/icons";
import { useQuery } from "convex/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Avatar } from "@/components/ui/Avatar";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { ProfileStackParamList } from "@/navigation/ProfileStack";
import { api } from "../../../convex/_generated/api";

type Props = NativeStackScreenProps<ProfileStackParamList, "ViewProfile">;

// Read-only profile card for another user — name, avatar, bio, genres, and
// clubs you're both members of. Intentionally shows no PII, stats, or social
// counts (follower-graph is out of scope per the vision's Won't-Have list).
export function UserProfileScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { userId } = route.params;

  const user = useQuery(api.users.getById, { userId });
  const mutual = useQuery(api.users.mutualClubs, { userId });

  if (user === undefined) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.textMuted} />
        </View>
      </SafeAreaView>
    );
  }

  if (user === null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
        <View style={{ padding: spacing.s5, gap: spacing.s2 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={spacing.s3}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ChevronLeft size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>
            Profile not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.s4,
          paddingTop: spacing.s2,
          paddingBottom: spacing.s3,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={spacing.s3}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.s5, gap: spacing.s5 }}>
        {/* Avatar + name + bio */}
        <View style={{ alignItems: "center", gap: spacing.s3 }}>
          <Avatar name={user.displayName} imageUri={user.avatarUrl} size="xl" />
          <Text style={{ ...typography.headingLg, color: colors.textPrimary }}>
            {user.displayName}
          </Text>
          {user.bio ? (
            <Text
              style={{
                ...typography.paragraphMd,
                color: colors.textSecondary,
                textAlign: "center",
              }}
            >
              {user.bio}
            </Text>
          ) : null}
        </View>

        {/* Genre tags */}
        {user.genres.length > 0 ? (
          <View style={{ gap: spacing.s2 }}>
            <Text style={{ ...typography.overlineLg, color: colors.textAccent }}>Reading interests</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.s2 }}>
              {user.genres.map((g) => (
                <View
                  key={g}
                  style={{
                    paddingVertical: spacing.s1,
                    paddingHorizontal: spacing.s3,
                    borderRadius: radius.pill,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ ...typography.bodySm, color: colors.textPrimary }}>{g}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Mutual clubs */}
        {mutual && mutual.length > 0 ? (
          <View style={{ gap: spacing.s2 }}>
            <Text style={{ ...typography.overlineLg, color: colors.textAccent }}>
              Clubs you're both in
            </Text>
            {mutual.map((club) => (
              <View
                key={club._id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.s3,
                  paddingVertical: spacing.s2,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: radius.sm,
                    overflow: "hidden",
                    backgroundColor: colors.surfaceSecondary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {club.coverImageUrl ? (
                    <Image
                      source={{ uri: club.coverImageUrl }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <Text
                      style={{
                        fontFamily: "Raleway-Bold",
                        fontSize: 16,
                        color: colors.textAlt,
                      }}
                    >
                      {club.name.slice(0, 1).toUpperCase()}
                    </Text>
                  )}
                </View>
                <Text
                  style={{
                    ...typography.bodyMd,
                    color: colors.textPrimary,
                    fontFamily: "Raleway-SemiBold",
                    flex: 1,
                  }}
                >
                  {club.name}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
