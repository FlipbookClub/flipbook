import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  Share,
  Text,
  View,
} from "react-native";
import { ChevronLeft, ExternalLink, ShieldCheck } from "lucide-react-native";
import { useQuery } from "convex/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { CommunityStackParamList } from "@/navigation/CommunityStack";
import { api } from "../../../convex/_generated/api";

type Props = NativeStackScreenProps<CommunityStackParamList, "InviteMembers">;

const DEEP_LINK_BASE = "flipbook://join";

export function InviteMembersScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { clubId, inviteCode } = route.params;
  const club = useQuery(api.clubs.get, { clubId });
  const [email, setEmail] = useState("");

  const inviteUrl = `${DEEP_LINK_BASE}/${inviteCode}`;

  const handleShare = async () => {
    if (!club) return;
    try {
      await Share.share({
        message: `Join my community "${club.name}" on Flipbook: ${inviteUrl}`,
        url: inviteUrl,
        title: club.name,
      });
    } catch {
      // User cancelled or share failed — no-op.
    }
  };

  const handleComplete = () => {
    navigation.replace("ClubDetail", { clubId });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
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

        <View style={{ paddingHorizontal: spacing.s4, paddingBottom: spacing.s5, gap: spacing.s5, flex: 1 }}>
          <View style={{ gap: spacing.s1 }}>
            <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>
              Invite members to your community
            </Text>
            <Text style={{ ...typography.paragraphMd, color: colors.textSecondary }}>
              Invite members into your community by email or using an invite link.
            </Text>
          </View>

          {club ? (
            <View
              style={{
                backgroundColor: palette.accentDeep,
                padding: spacing.s4,
                borderRadius: radius.md,
                gap: spacing.s2,
              }}
            >
              <Text
                style={{
                  ...typography.bodyLg,
                  fontFamily: "Raleway-Bold",
                  color: palette.textOnBrand,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {club.name}
              </Text>
              {club.description ? (
                <Text
                  style={{
                    ...typography.bodySm,
                    color: palette.textOnBrand,
                    opacity: 0.9,
                  }}
                >
                  {club.description}
                </Text>
              ) : null}
              <Text
                style={{
                  ...typography.bodySm,
                  color: palette.textOnBrand,
                  fontFamily: "Raleway-SemiBold",
                  marginTop: spacing.s1,
                }}
              >
                Code: {inviteCode}
              </Text>
            </View>
          ) : null}

          <View style={{ gap: spacing.s3 }}>
            <Input
              variant="underline"
              placeholder="Email address"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Pressable
              onPress={handleShare}
              hitSlop={spacing.s2}
              accessibilityRole="button"
              accessibilityLabel="Share invite link"
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.s2,
                alignSelf: "flex-start",
                paddingVertical: spacing.s2,
              }}
            >
              <ExternalLink size={16} color={palette.accent} />
              <Text
                style={{
                  ...typography.bodyMd,
                  color: palette.accent,
                  fontFamily: "Raleway-SemiBold",
                }}
              >
                Share invite link
              </Text>
            </Pressable>
          </View>

          <View style={{ flex: 1 }} />

          <Button label="Complete setup" fullWidth onPress={handleComplete} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
