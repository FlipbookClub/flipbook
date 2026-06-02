import { useCallback, useState } from "react";
import { Pressable, RefreshControl, SafeAreaView, ScrollView, Text, View } from "react-native";
import { CircleDashed, Leaf, Rocket } from "lucide-react-native";
import { useQuery } from "convex/react";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ClubCard } from "@/components/features/ClubCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Wordmark } from "@/components/ui/Wordmark";
import { isOnlineNow } from "@/lib/connectivity";
import { Moon, Sparkles, Sun } from "lucide-react-native";
import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";
import type { ThemeMode } from "@/theme/themes";

import { api } from "../../../convex/_generated/api";
import type { MainTabsParamList } from "@/navigation/MainTabs";
import type { CommunityStackParamList } from "@/navigation/CommunityStack";

type Props = CompositeScreenProps<
  NativeStackScreenProps<CommunityStackParamList, "CommunityHome">,
  BottomTabScreenProps<MainTabsParamList>
>;

const MODE_CYCLE: ThemeMode[] = ["light", "flip", "dark"];
function nextMode(current: ThemeMode): ThemeMode {
  const i = MODE_CYCLE.indexOf(current);
  return MODE_CYCLE[(i + 1) % MODE_CYCLE.length];
}

// Placeholder club rows shown while the live query is still resolving — keeps
// the home screen from flashing the "create/join" prompt at returning members.
function ClubSkeletons({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height={76} borderRadius={radius.md} />
      ))}
    </>
  );
}

interface ActionCardProps {
  variant: "primary" | "secondary";
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function ActionCard({ variant, icon, title, subtitle, onPress }: ActionCardProps) {
  const [pressed, setPressed] = useState(false);
  const base = variant === "primary" ? palette.accentDeep : palette.accent;
  const surface = pressed
    ? variant === "primary"
      ? palette.brandPrimaryPressed
      : palette.accentPressed
    : base;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={{
        flexDirection: "row",
        gap: spacing.s3,
        alignItems: "center",
        padding: spacing.s4,
        borderRadius: radius.md,
        backgroundColor: surface,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            ...typography.bodyLg,
            fontFamily: "Raleway-SemiBold",
            color: palette.textOnBrand,
          }}
        >
          {title}
        </Text>
        <Text style={{ ...typography.bodySm, color: palette.textOnBrand, opacity: 0.85 }}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

export function CommunityHomeScreen({ navigation }: Props) {
  const { colors, mode, setMode } = useTheme();
  const me = useQuery(api.users.me);
  const myClubs = useQuery(api.clubs.listMine);
  const popularClubs = useQuery(api.clubs.listPublic, {});

  const ModeIcon = mode === "dark" ? Moon : mode === "flip" ? Sparkles : Sun;
  const firstName = me?.firstName ?? me?.displayName ?? "there";
  const hasClubs = !!myClubs && myClubs.length > 0;

  const [refreshing, setRefreshing] = useState(false);
  // Queries are live; pull-to-refresh re-probes the network (honest gesture).
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await isOnlineNow();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const goCreate = () => navigation.navigate("CreateCommunity");
  const goJoin = () => navigation.navigate("JoinCommunity");
  const openClub = (clubId: string) =>
    navigation.navigate("ClubDetail", { clubId: clubId as never });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.s4,
          paddingTop: spacing.s2,
          paddingBottom: spacing.s2,
        }}
      >
        <Wordmark size={32} />
        <Pressable
          onPress={() => setMode(nextMode(mode))}
          hitSlop={spacing.s3}
          accessibilityRole="button"
          accessibilityLabel="Change theme"
        >
          <ModeIcon size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingBottom: spacing.s7, gap: spacing.s5 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textMuted}
            colors={[palette.accent]}
          />
        }
      >
        <View style={{ gap: spacing.s2, marginTop: spacing.s3 }}>
          <Text style={{ ...typography.displayMd, color: colors.textPrimary }}>
            Welcome {firstName} 👋🏽
          </Text>
          <View
            style={{
              alignSelf: "flex-start",
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.s2,
              paddingVertical: spacing.s1,
              paddingHorizontal: spacing.s3,
              borderRadius: radius.pill,
              backgroundColor: colors.surfaceSecondary,
            }}
          >
            <Leaf size={14} color={palette.accent} />
            <Text style={{ ...typography.bodySm, color: colors.textPrimary, fontStyle: "italic" }}>
              Books are a uniquely portable magic
            </Text>
          </View>
        </View>

        {myClubs === undefined ? (
          <View style={{ gap: spacing.s2 }}>
            <Text style={{ ...typography.overlineLg, color: colors.textMuted }}>
              My communities
            </Text>
            <ClubSkeletons count={2} />
          </View>
        ) : !hasClubs ? (
          <View style={{ gap: spacing.s3 }}>
            <Text style={{ ...typography.bodyMd, color: colors.textSecondary }}>
              Please complete at least one of these actions.
            </Text>
            <ActionCard
              variant="primary"
              icon={<Rocket size={18} color={palette.textOnBrand} />}
              title="Create a community"
              subtitle="Initiate a book community and invite your friends."
              onPress={goCreate}
            />
            <ActionCard
              variant="secondary"
              icon={<CircleDashed size={18} color={palette.textOnBrand} />}
              title="Join an existing community"
              subtitle="Search and join an existing Flipbook community."
              onPress={goJoin}
            />
          </View>
        ) : (
          <View style={{ gap: spacing.s2 }}>
            <Text style={{ ...typography.overlineLg, color: colors.textMuted }}>
              My communities
            </Text>
            {myClubs.map((club) => (
              <ClubCard
                key={club._id}
                club={{
                  name: club.name,
                  moderatorName: club.role === "moderator" ? "You" : undefined,
                  memberCount: club.memberCount,
                  coverImageUrl: club.coverImageUrl,
                  isMember: true,
                }}
                onPress={() => openClub(club._id)}
              />
            ))}
          </View>
        )}

        <View style={{ gap: spacing.s2 }}>
          <Text style={{ ...typography.overlineLg, color: colors.textMuted }}>
            Popular communities
          </Text>
          {popularClubs === undefined ? (
            <ClubSkeletons count={2} />
          ) : popularClubs.length > 0 ? (
            popularClubs.map((club) => (
              <ClubCard
                key={club._id}
                club={{
                  name: club.name,
                  description: club.description,
                  memberCount: club.memberCount,
                  coverImageUrl: club.coverImageUrl,
                  lastActivityAt: club.lastActivityAt,
                }}
                onPress={() => openClub(club._id)}
              />
            ))
          ) : (
            <EmptyState
              compact
              title="No public communities yet"
              description="Be the first to share one."
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
