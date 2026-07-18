import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "convex/react";

import { isOnlineNow } from "@/lib/connectivity";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { BookListCard } from "@/components/features/BookListCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";

import type { LibraryStackParamList } from "@/navigation/LibraryStack";
import { api } from "../../../convex/_generated/api";

type Props = NativeStackScreenProps<LibraryStackParamList, "LibraryHome">;
type TabKey = "reading" | "finished";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "reading", label: "Reading" },
  { key: "finished", label: "Finished" },
];

// Placeholder cards that match the BookListCard layout while the query loads.
function LibrarySkeletons() {
  const { colors } = useTheme();
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <View
          key={i}
          style={{
            flexDirection: "row",
            gap: spacing.s3,
            padding: spacing.s3,
            borderRadius: radius.sm,
            backgroundColor: colors.surfaceSecondary,
          }}
        >
          <Skeleton width={56} height={80} borderRadius={radius.sm} />
          <View style={{ flex: 1, gap: spacing.s2, justifyContent: "center" }}>
            <Skeleton width="70%" height={14} />
            <Skeleton width="45%" height={12} />
            <Skeleton width="100%" height={6} borderRadius={radius.sm} style={{ marginTop: spacing.s1 }} />
          </View>
        </View>
      ))}
    </>
  );
}

export function LibraryScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const library = useQuery(api.progress.listMyLibrary);
  const [tab, setTab] = useState<TabKey>("reading");
  const [refreshing, setRefreshing] = useState(false);

  // The library query is live, so there's nothing to refetch — but pull-to-
  // refresh is the expected gesture, and we make it honest by re-probing the
  // network (which updates the offline banner if connectivity changed).
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await isOnlineNow();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const { reading, finished } = useMemo(() => {
    if (!library) return { reading: [], finished: [] };
    return {
      reading: library.filter((i) => i.finishedAt === undefined),
      finished: library.filter((i) => i.finishedAt !== undefined),
    };
  }, [library]);

  const visible = tab === "reading" ? reading : finished;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
      <View style={{ paddingHorizontal: spacing.s5, paddingTop: spacing.s3, gap: spacing.s4 }}>
        <Text style={{ ...typography.headingLg, color: colors.textPrimary }}>Library</Text>
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

      <ScrollView
        contentContainerStyle={{
          padding: spacing.s5,
          paddingBottom: spacing.s7,
          gap: spacing.s4,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textMuted}
            colors={[palette.accent]}
          />
        }
      >
        {library === undefined ? (
          <LibrarySkeletons />
        ) : visible.length === 0 ? (
          <EmptyState
            title={tab === "reading" ? "Nothing in progress" : "No finished books yet"}
            description={
              tab === "reading"
                ? "Join a club and open a book to start reading."
                : "Books you finish will land here."
            }
          />
        ) : (
          visible.map((item) => {
            const pct = Math.round((item.currentPage / item.totalPages) * 100);
            return (
              <BookListCard
                key={item._id}
                title={item.book.title}
                author={item.book.author}
                pageCount={item.book.pdfPageCount}
                coverUrl={item.book.coverImageUrl}
                subtitle={item.club.name}
                surface={item.finishedAt ? "primary" : "secondary"}
                progress={
                  item.finishedAt
                    ? undefined
                    : { label: `Page ${item.currentPage} of ${item.totalPages}`, pct }
                }
                onOpen={() => navigation.navigate("Reader", { bookId: item.book._id })}
              />
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
