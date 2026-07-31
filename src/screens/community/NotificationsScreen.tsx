import { FlatList, Linking, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, usePaginatedQuery } from "convex/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Bell, ChevronLeft } from "@/lib/icons";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { CommunityStackParamList } from "@/navigation/CommunityStack";
import type { Doc } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

// Same relative-time shape as ReactionDetailsSheet's formatRelative — kept
// as a separate copy rather than shared util since neither screen imports
// from the other and the format is a one-liner.
function formatRelative(ts: number): string {
  const diffMs = Date.now() - ts;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

type Props = NativeStackScreenProps<CommunityStackParamList, "Notifications">;

export function NotificationsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);
  const { results, status, loadMore } = usePaginatedQuery(
    api.notifications.list,
    {},
    { initialNumItems: 25 },
  );

  const hasUnread = results.some((n) => !n.isRead);

  const handlePress = async (n: Doc<"notifications">) => {
    if (!n.isRead) markRead({ notificationId: n._id }).catch(() => undefined);
    // Re-enters React Navigation's own linking pipeline (see
    // src/lib/deeplinks.ts) — no manual route parsing needed here.
    Linking.openURL(n.deepLink).catch(() => undefined);
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
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
        <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>Notifications</Text>
        <Pressable
          onPress={() => markAllRead({})}
          hitSlop={spacing.s3}
          disabled={!hasUnread}
          accessibilityRole="button"
          accessibilityLabel="Mark all as read"
          style={{ opacity: hasUnread ? 1 : 0 }}
        >
          <Text style={{ ...typography.uiLabelMd, color: palette.brandPrimary }}>Mark all read</Text>
        </Pressable>
      </View>

      {status === "LoadingFirstPage" ? (
        <View style={{ paddingHorizontal: spacing.s4, gap: spacing.s3 }}>
          <Skeleton height={64} borderRadius={radius.md} />
          <Skeleton height={64} borderRadius={radius.md} />
          <Skeleton height={64} borderRadius={radius.md} />
        </View>
      ) : results.length === 0 ? (
        <View style={{ paddingHorizontal: spacing.s4, paddingTop: spacing.s6 }}>
          <EmptyState
            icon={<Bell size={28} color={colors.textMuted} />}
            title="Nothing yet"
            description="Replies, chapter drops, and community updates will show up here."
          />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(n) => n._id}
          contentContainerStyle={{ paddingHorizontal: spacing.s4, paddingBottom: spacing.s6, gap: spacing.s2 }}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (status === "CanLoadMore") loadMore(25);
          }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handlePress(item)}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              style={{
                flexDirection: "row",
                gap: spacing.s3,
                padding: spacing.s3,
                borderRadius: radius.md,
                backgroundColor: item.isRead ? "transparent" : colors.surfaceSecondary,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginTop: 6,
                  backgroundColor: item.isRead ? "transparent" : palette.accent,
                }}
              />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ ...typography.bodyLg, fontFamily: "Raleway-SemiBold", color: colors.textPrimary }}>
                  {item.title}
                </Text>
                <Text style={{ ...typography.bodySm, color: colors.textSecondary }} numberOfLines={2}>
                  {item.body}
                </Text>
                <Text style={{ ...typography.uiLabelMd, color: colors.textMuted, marginTop: 2 }}>
                  {formatRelative(item.sentAt)}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
