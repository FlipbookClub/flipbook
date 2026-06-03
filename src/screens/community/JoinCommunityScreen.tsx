import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { ChevronLeft, Lock, Search, ShieldCheck } from "@/lib/icons";
import { useMutation, useQuery } from "convex/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@/components/ui/Button";
import { ClubCard } from "@/components/features/ClubCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { analytics } from "@/lib/analytics";
import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { CommunityStackParamList } from "@/navigation/CommunityStack";
import { api } from "../../../convex/_generated/api";

type Props = NativeStackScreenProps<CommunityStackParamList, "JoinCommunity">;

const CODE_LENGTH = 6;

export function JoinCommunityScreen({ navigation }: Props) {
  const { colors } = useTheme();

  const [privateMode, setPrivateMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const joinByCode = useMutation(api.memberships.joinByCode);
  const popular = useQuery(
    api.clubs.listPublic,
    privateMode
      ? "skip"
      : { searchTerm: searchTerm.trim() ? searchTerm.trim() : undefined, limit: 20 },
  );

  const normalizedCode = inviteCode.trim().toUpperCase();
  const canSubmitCode = normalizedCode.length === CODE_LENGTH && !submitting;

  const handleJoinByCode = async () => {
    if (!canSubmitCode) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const clubId = await joinByCode({ inviteCode: normalizedCode });
      analytics.track("club_joined", { via: "code" });
      navigation.replace("ClubDetail", { clubId });
    } catch (err) {
      const code = (err as { data?: { code?: string } })?.data?.code;
      const message =
        code === "club_not_found"
          ? "No community matches that code."
          : code === "invalid_code"
            ? "Enter a 6-character code."
            : code === "pro_required"
              ? "You're at the 3-club limit on the free tier. Flipbook Pro will lift the cap — coming soon."
              : code ?? (err as { message?: string })?.message ?? "Couldn't join with that code.";
      setFormError(message);
      setSubmitting(false);
    }
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

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing.s4,
            paddingBottom: spacing.s5,
            gap: spacing.s5,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ gap: spacing.s1 }}>
            <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>
              Join a community
            </Text>
            <Text style={{ ...typography.paragraphMd, color: colors.textSecondary }}>
              Search the open Flipbook community or enter a private code you were given.
            </Text>
          </View>

          {privateMode ? (
            <View style={{ gap: spacing.s3 }}>
              <Input
                variant="underline"
                placeholder="Club code"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={CODE_LENGTH}
                value={inviteCode}
                onChangeText={(text) => setInviteCode(text.replace(/\s/g, "").toUpperCase())}
                rightIcon={<Lock size={18} color={colors.textMuted} />}
                helperText={
                  !formError && normalizedCode.length === CODE_LENGTH
                    ? "Looks good — tap Join community."
                    : undefined
                }
                errorText={formError ?? undefined}
                returnKeyType="go"
                onSubmitEditing={handleJoinByCode}
              />
            </View>
          ) : (
            <Input
              variant="underline"
              placeholder="Search public communities"
              autoCapitalize="none"
              autoCorrect={false}
              value={searchTerm}
              onChangeText={setSearchTerm}
              rightIcon={<Search size={18} color={colors.textMuted} />}
            />
          )}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.s3,
            }}
          >
            <Switch
              value={privateMode}
              onValueChange={(v) => {
                setPrivateMode(v);
                setFormError(null);
              }}
              trackColor={{ true: palette.brandPrimary, false: colors.border }}
              thumbColor={palette.textOnBrand}
              accessibilityLabel="I'm joining a private community"
            />
            <Text style={{ ...typography.bodyMd, color: colors.textPrimary, flex: 1 }}>
              I'm joining a private community
            </Text>
          </View>

          {/* Popular communities — hidden entirely when there are none and the
              user isn't searching; only surfaces once public clubs exist. */}
          {!privateMode &&
          (popular === undefined || popular.length > 0 || searchTerm.trim().length > 0) ? (
            <View style={{ gap: spacing.s2 }}>
              <Text style={{ ...typography.overlineLg, color: colors.textPrimary }}>
                Popular communities
              </Text>
              {popular === undefined ? (
                <>
                  <Skeleton height={76} borderRadius={radius.md} />
                  <Skeleton height={76} borderRadius={radius.md} />
                </>
              ) : popular.length > 0 ? (
                popular.map((club) => (
                  <ClubCard
                    key={club._id}
                    club={{
                      name: club.name,
                      description: club.description,
                      memberCount: club.memberCount,
                      coverImageUrl: club.coverImageUrl,
                    }}
                    onPress={() => navigation.navigate("ClubDetail", { clubId: club._id })}
                  />
                ))
              ) : (
                <EmptyState
                  compact
                  title="No communities match that search"
                  description="Try a different name, or join with a private code."
                />
              )}
            </View>
          ) : null}
        </ScrollView>

        {privateMode ? (
          <View style={{ paddingHorizontal: spacing.s4, paddingBottom: spacing.s5 }}>
            <Button
              label={submitting ? "Joining…" : "Join community"}
              fullWidth
              disabled={!canSubmitCode}
              onPress={handleJoinByCode}
            />
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
