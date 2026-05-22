import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useQuery } from "convex/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { BookCover } from "@/components/features/BookCover";
import { Card } from "@/components/ui/Card";
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

export function LibraryScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const library = useQuery(api.progress.listMyLibrary);
  const [tab, setTab] = useState<TabKey>("reading");

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
      >
        {library === undefined ? null : visible.length === 0 ? (
          <Card>
            <View style={{ gap: spacing.s2, paddingVertical: spacing.s3, alignItems: "center" }}>
              <Text
                style={{
                  ...typography.bodyLg,
                  color: colors.textPrimary,
                  fontFamily: "Raleway-SemiBold",
                }}
              >
                {tab === "reading" ? "Nothing in progress" : "No finished books yet"}
              </Text>
              <Text style={{ ...typography.bodySm, color: colors.textMuted, textAlign: "center" }}>
                {tab === "reading"
                  ? "Join a club and open a book to start reading."
                  : "Books you finish will land here."}
              </Text>
            </View>
          </Card>
        ) : (
          visible.map((item) => {
            const pct = Math.round((item.currentPage / item.totalPages) * 100);
            return (
              <Pressable
                key={item._id}
                onPress={() => navigation.navigate("Reader", { bookId: item.book._id })}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.book.title}`}
                style={{
                  flexDirection: "row",
                  gap: spacing.s4,
                  alignItems: "flex-start",
                }}
              >
                <BookCover
                  title={item.book.title}
                  author={item.book.author}
                  pageCount={item.book.pdfPageCount}
                  size="sm"
                />
                <View style={{ flex: 1, gap: spacing.s1, paddingTop: spacing.s1 }}>
                  <Text
                    style={{
                      ...typography.bodyLg,
                      color: colors.textPrimary,
                      fontFamily: "Raleway-SemiBold",
                    }}
                    numberOfLines={2}
                  >
                    {item.book.title}
                  </Text>
                  <Text style={{ ...typography.bodySm, color: colors.textMuted }} numberOfLines={1}>
                    {item.book.author} · {item.club.name}
                  </Text>
                  <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.surfaceSecondary, marginTop: spacing.s2 }}>
                    <View
                      style={{
                        width: `${pct}%`,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: palette.accentStrong,
                      }}
                    />
                  </View>
                  <Text style={{ ...typography.uiLabelMd, color: colors.textMuted }}>
                    {item.finishedAt ? "Finished" : `Page ${item.currentPage} of ${item.totalPages} · ${pct}%`}
                  </Text>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
