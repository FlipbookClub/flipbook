import { useCallback, useState } from "react";
import {
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, ShieldCheck } from "@/lib/icons";
import { useMutation, useQuery } from "convex/react";
import { useFocusEffect, type CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@/components/ui/Button";
import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { CommunityStackParamList } from "@/navigation/CommunityStack";
import type { MainTabsParamList } from "@/navigation/MainTabs";
import { api } from "../../../convex/_generated/api";
import { userFacingError } from "@/lib/monitoring";

type Props = CompositeScreenProps<
  NativeStackScreenProps<CommunityStackParamList, "InviteAccept">,
  BottomTabScreenProps<MainTabsParamList>
>;

// Landing page for `flipbook://join/{code}` deep links. Looks up the club
// via the invite code, shows a preview, then accepting calls joinByCode and
// routes to the ClubDetail. If the code is invalid, surface a clear message
// instead of the deep-link feeling broken.
export function InviteAcceptScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const inviteCode = route.params.inviteCode.toUpperCase();
  const club = useQuery(api.clubs.getByInviteCode, { inviteCode });
  const joinByCode = useMutation(api.memberships.joinByCode);
  const me = useQuery(api.users.me);

  // Hides the bottom tab bar while this screen is focused — see the matching
  // fix + explanation in JoinCommunityScreen.tsx.
  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({ tabBarStyle: { display: "none" } });
      return () => {
        parent?.setOptions({ tabBarStyle: undefined });
      };
    }, [navigation]),
  );

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!club) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const clubId = await joinByCode({ inviteCode });
      navigation.replace("ClubDetail", { clubId });
    } catch (err) {
      const code = (err as { data?: { code?: string } })?.data?.code;
      // FR-027: free tier 3-club cap. Surface a brand-aligned upgrade nudge.
      // The real Pro upgrade flow lands once RevenueCat is wired (Phase 6
      // post-Apple-Developer enrollment).
      const message =
        code === "pro_required"
          ? "You're at the 3-club limit on the free tier. Flipbook Pro will lift the cap — coming soon."
          : userFacingError(err, { where: "invite_accept", code }, "Couldn't join. Please try again.");
      setFormError(message);
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.surfacePrimary }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
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
        <ShieldCheck size={22} color={colors.textPrimary} />
      </View>

      <View
        style={{
          flex: 1,
          paddingHorizontal: spacing.s4,
          paddingBottom: spacing.s4 + insets.bottom,
          gap: spacing.s5,
        }}
      >
        <View style={{ gap: spacing.s1 }}>
          <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>
            You've been invited
          </Text>
          <Text style={{ ...typography.paragraphMd, color: colors.textSecondary }}>
            Accept to join this community on Flipbook.
          </Text>
        </View>

        {club === undefined ? (
          <Text style={{ ...typography.bodyMd, color: colors.textMuted }}>
            Loading invite…
          </Text>
        ) : club === null ? (
          <View
            style={{
              padding: spacing.s4,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border,
              gap: spacing.s2,
            }}
          >
            <Text style={{ ...typography.bodyLg, color: colors.textPrimary, fontFamily: "Raleway-SemiBold" }}>
              Invite expired or invalid
            </Text>
            <Text style={{ ...typography.bodySm, color: colors.textSecondary }}>
              We couldn't find a community for the code{" "}
              <Text style={{ fontFamily: "Raleway-SemiBold" }}>{inviteCode}</Text>. Ask the
              moderator for a new link.
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: palette.accentDeep,
              padding: spacing.s4,
              borderRadius: radius.md,
              flexDirection: "row",
              gap: spacing.s3,
            }}
          >
            {club.coverImageUrl ? (
              <Image
                source={{ uri: club.coverImageUrl }}
                style={{ width: 48, height: 48, borderRadius: radius.sm }}
              />
            ) : null}
            <View style={{ flex: 1, gap: spacing.s2 }}>
              <Text
                style={{
                  ...typography.bodyLg,
                  color: palette.textOnBrand,
                  fontFamily: "Raleway-Bold",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {club.name}
              </Text>
              {club.description ? (
                <Text style={{ ...typography.bodySm, color: palette.textOnBrand, opacity: 0.9 }}>
                  {club.description}
                </Text>
              ) : null}
              <Text style={{ ...typography.bodySm, color: palette.textOnBrand, opacity: 0.85 }}>
                {club.memberCount.toLocaleString()} {club.memberCount === 1 ? "member" : "members"}
              </Text>
            </View>
          </View>
        )}

        <View style={{ flex: 1 }} />

        {formError ? (
          <Text
            style={{
              ...typography.bodySm,
              color: palette.error,
              textAlign: "center",
              marginBottom: spacing.s2,
            }}
          >
            {formError}
          </Text>
        ) : null}

        {club ? (
          <Button
            label={submitting ? "Joining…" : me ? "Accept invite" : "Sign in to join"}
            fullWidth
            disabled={submitting || !me}
            onPress={handleAccept}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}
