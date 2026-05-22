import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Share, Text, View } from "react-native";
import { ChevronLeft, Settings, Share2 } from "lucide-react-native";
import { useQuery } from "convex/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { ClubModeratorSheet } from "@/components/features/ClubModeratorSheet";
import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { CommunityStackParamList } from "@/navigation/CommunityStack";
import { api } from "../../../convex/_generated/api";

type Props = NativeStackScreenProps<CommunityStackParamList, "ClubDetail">;
type TabKey = "book" | "members" | "activity";

const DEEP_LINK_BASE = "flipbook://join";
const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "book", label: "Book" },
  { key: "members", label: "Members" },
  { key: "activity", label: "Activity" },
];

export function ClubDetailScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { clubId } = route.params;
  const club = useQuery(api.clubs.get, { clubId });
  const members = useQuery(api.memberships.listClubMembers, { clubId });
  const me = useQuery(api.users.me);

  const [tab, setTab] = useState<TabKey>("members");
  const [sheetOpen, setSheetOpen] = useState(false);

  const isModerator = !!me && !!club && club.moderatorId === me._id;
  const inviteUrl = club ? `${DEEP_LINK_BASE}/${club.inviteCode}` : null;

  const handleShare = async () => {
    if (!club || !inviteUrl) return;
    try {
      await Share.share({
        message: `Join "${club.name}" on Flipbook: ${inviteUrl}`,
        url: inviteUrl,
        title: club.name,
      });
    } catch {
      // user cancelled
    }
  };

  if (club === undefined) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }} />;
  }

  if (club === null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
        <View style={{ padding: spacing.s5, gap: spacing.s2 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={spacing.s3}
            accessibilityLabel="Back"
            accessibilityRole="button"
          >
            <ChevronLeft size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>
            Community not found
          </Text>
          <Text style={{ ...typography.bodyMd, color: colors.textSecondary }}>
            This community may have been deleted or you don't have access.
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
          justifyContent: "space-between",
          paddingHorizontal: spacing.s4,
          paddingTop: spacing.s2,
          paddingBottom: spacing.s3,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={spacing.s3}
          accessibilityLabel="Back"
          accessibilityRole="button"
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flexDirection: "row", gap: spacing.s3 }}>
          <Pressable
            onPress={handleShare}
            hitSlop={spacing.s3}
            accessibilityLabel="Share invite link"
            accessibilityRole="button"
          >
            <Share2 size={22} color={colors.textPrimary} />
          </Pressable>
          {isModerator ? (
            <Pressable
              onPress={() => setSheetOpen(true)}
              hitSlop={spacing.s3}
              accessibilityLabel="Club settings"
              accessibilityRole="button"
            >
              <Settings size={22} color={colors.textPrimary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.s7 }}>
        <View style={{ paddingHorizontal: spacing.s4, gap: spacing.s4 }}>
          <View
            style={{
              flexDirection: "row",
              gap: spacing.s4,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 84,
                height: 84,
                borderRadius: radius.md,
                backgroundColor: colors.surfaceSecondary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: "Raleway-Bold", fontSize: 28, color: palette.brandPrimary }}>
                {club.name.slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1, gap: spacing.s1 }}>
              <Text style={{ ...typography.headingLg, color: colors.textPrimary }} numberOfLines={2}>
                {club.name}
              </Text>
              <Text style={{ ...typography.bodySm, color: colors.textMuted }}>
                {club.memberCount.toLocaleString()} {club.memberCount === 1 ? "member" : "members"}
                {" · "}
                {club.visibility === "private" ? "Private" : "Public"}
              </Text>
            </View>
          </View>

          {club.description ? (
            <Text style={{ ...typography.paragraphMd, color: colors.textSecondary }}>
              {club.description}
            </Text>
          ) : null}

          <View
            style={{
              flexDirection: "row",
              backgroundColor: colors.surfaceSecondary,
              borderRadius: radius.pill,
              padding: 4,
            }}
          >
            {TABS.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === t.key }}
                style={{
                  flex: 1,
                  paddingVertical: spacing.s2,
                  alignItems: "center",
                  borderRadius: radius.pill,
                  backgroundColor: tab === t.key ? colors.surfacePrimary : "transparent",
                }}
              >
                <Text
                  style={{
                    ...typography.bodyMd,
                    fontFamily: "Raleway-SemiBold",
                    color: tab === t.key ? colors.textPrimary : colors.textMuted,
                  }}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ padding: spacing.s4 }}>
          {tab === "book" ? (
            <Card>
              <View style={{ gap: spacing.s2, alignItems: "center", paddingVertical: spacing.s3 }}>
                <Text style={{ ...typography.bodyLg, color: colors.textPrimary, fontFamily: "Raleway-SemiBold" }}>
                  No book yet
                </Text>
                <Text style={{ ...typography.bodySm, color: colors.textMuted, textAlign: "center" }}>
                  Book upload + reading land in Phase 3.
                </Text>
              </View>
            </Card>
          ) : tab === "activity" ? (
            <Card>
              <View style={{ gap: spacing.s2, alignItems: "center", paddingVertical: spacing.s3 }}>
                <Text style={{ ...typography.bodyLg, color: colors.textPrimary, fontFamily: "Raleway-SemiBold" }}>
                  Quiet for now
                </Text>
                <Text style={{ ...typography.bodySm, color: colors.textMuted, textAlign: "center" }}>
                  Reactions + activity feed land in Phase 4.
                </Text>
              </View>
            </Card>
          ) : (
            <View style={{ gap: spacing.s2 }}>
              {members?.map((m) => (
                <View
                  key={m._id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.s3,
                    paddingVertical: spacing.s2,
                  }}
                >
                  <Avatar
                    name={`${m.firstName} ${m.lastName}`.trim() || m.displayName}
                    imageUri={m.avatarUrl}
                    size="md"
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ ...typography.bodyMd, color: colors.textPrimary, fontFamily: "Raleway-SemiBold" }}>
                      {m.displayName}
                    </Text>
                    <Text style={{ ...typography.bodySm, color: colors.textMuted }}>
                      {`${m.firstName} ${m.lastName}`.trim()}
                    </Text>
                  </View>
                  {m.role === "moderator" ? (
                    <View
                      style={{
                        paddingVertical: 2,
                        paddingHorizontal: spacing.s2,
                        borderRadius: radius.pill,
                        backgroundColor: palette.accent,
                      }}
                    >
                      <Text
                        style={{
                          ...typography.uiLabelMd,
                          fontSize: 10,
                          color: palette.textOnBrand,
                          fontFamily: "Raleway-SemiBold",
                        }}
                      >
                        MOD
                      </Text>
                    </View>
                  ) : null}
                </View>
              ))}
              {members?.length === 0 ? (
                <Text style={{ ...typography.bodySm, color: colors.textMuted, textAlign: "center" }}>
                  No members yet.
                </Text>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>

      {isModerator ? (
        <ClubModeratorSheet
          visible={sheetOpen}
          club={club}
          onClose={() => setSheetOpen(false)}
          onDeleted={() => navigation.popToTop()}
        />
      ) : null}
    </SafeAreaView>
  );
}
