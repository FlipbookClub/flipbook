import { useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, Share, Text, View } from "react-native";
import { BookPlus, ChevronLeft, Settings, Share2 } from "lucide-react-native";
import { useQuery } from "convex/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BookCover } from "@/components/features/BookCover";
import { BookUploadSheet } from "@/components/features/BookUploadSheet";
import { ClubModeratorSheet } from "@/components/features/ClubModeratorSheet";
import { ProgressVisualization } from "@/components/features/ProgressVisualization";
import { MAX_PDF_BYTES, pickPdf, type PickedPdf } from "@/lib/pdf";
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
  const books = useQuery(api.books.listForClub, { clubId });
  const activeBook = books && books.length > 0 ? books[0] : null;
  const progressRows = useQuery(
    api.progress.listForClub,
    activeBook ? { clubId, bookId: activeBook._id } : "skip",
  );
  const activity = useQuery(
    api.reactions.listForBook,
    activeBook ? { clubId, bookId: activeBook._id, limit: 20 } : "skip",
  );
  const me = useQuery(api.users.me);

  const [tab, setTab] = useState<TabKey>("book");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pickedFile, setPickedFile] = useState<PickedPdf | null>(null);

  const isModerator = !!me && !!club && club.moderatorId === me._id;
  const canUpload =
    isModerator || (!!club && club.permissions.membersCanUploadBooks);
  const inviteUrl = club ? `${DEEP_LINK_BASE}/${club.inviteCode}` : null;

  const handleAddBook = async () => {
    const result = await pickPdf();
    if (!result.ok) {
      if (result.reason === "cancelled") return;
      const message =
        result.reason === "too_large"
          ? `Books are limited to ${Math.round(MAX_PDF_BYTES / (1024 * 1024))}MB. Try a smaller file.`
          : result.reason === "not_pdf"
            ? "That doesn't look like a PDF. Pick a .pdf file."
            : "Couldn't read that file. Try a different one.";
      Alert.alert("Can't upload", message);
      return;
    }
    setPickedFile(result.file);
  };

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
            books && books.length > 0 ? (
              <View style={{ gap: spacing.s4 }}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.s4 }}>
                  {books.map((b) => (
                    <BookCover
                      key={b._id}
                      title={b.title}
                      author={b.author}
                      pageCount={b.pdfPageCount}
                      onPress={() => navigation.navigate("Reader", { bookId: b._id })}
                    />
                  ))}
                </View>
                {activeBook ? (
                  <ProgressVisualization
                    rows={progressRows?.map((p) => ({
                      userId: p.userId,
                      displayName: p.user.displayName,
                      avatarUrl: p.user.avatarUrl,
                      currentPage: p.currentPage,
                      totalPages: p.totalPages,
                    }))}
                    bookTitle={activeBook.title}
                  />
                ) : null}
                {canUpload ? (
                  <Button label="Add another book" variant="secondary" fullWidth onPress={handleAddBook} />
                ) : null}
              </View>
            ) : (
              <Card>
                <View style={{ gap: spacing.s3, alignItems: "center", paddingVertical: spacing.s3 }}>
                  <Text style={{ ...typography.bodyLg, color: colors.textPrimary, fontFamily: "Raleway-SemiBold" }}>
                    No book yet
                  </Text>
                  <Text style={{ ...typography.bodySm, color: colors.textMuted, textAlign: "center" }}>
                    {canUpload
                      ? "Upload a PDF to kick off the club's first read."
                      : "Waiting on the moderator to add the first book."}
                  </Text>
                  {canUpload ? (
                    <Button
                      label="Add a book"
                      onPress={handleAddBook}
                      leadingIcon={<BookPlus size={18} color={palette.textOnBrand} />}
                    />
                  ) : null}
                </View>
              </Card>
            )
          ) : tab === "activity" ? (
            !activeBook ? (
              <Card>
                <View style={{ gap: spacing.s2, alignItems: "center", paddingVertical: spacing.s3 }}>
                  <Text style={{ ...typography.bodyLg, color: colors.textPrimary, fontFamily: "Raleway-SemiBold" }}>
                    Quiet for now
                  </Text>
                  <Text style={{ ...typography.bodySm, color: colors.textMuted, textAlign: "center" }}>
                    Once a book is open, reactions show up here in real time.
                  </Text>
                </View>
              </Card>
            ) : activity && activity.length === 0 ? (
              <Card>
                <View style={{ gap: spacing.s2, alignItems: "center", paddingVertical: spacing.s3 }}>
                  <Text style={{ ...typography.bodyLg, color: colors.textPrimary, fontFamily: "Raleway-SemiBold" }}>
                    No reactions yet
                  </Text>
                  <Text style={{ ...typography.bodySm, color: colors.textMuted, textAlign: "center" }}>
                    Long-press a page in the reader to drop the first one.
                  </Text>
                </View>
              </Card>
            ) : (
              <View style={{ gap: spacing.s2 }}>
                {activity?.map((r) => (
                  <Pressable
                    key={r._id}
                    onPress={() =>
                      navigation.navigate("Reader", {
                        bookId: activeBook._id,
                        jumpToPage: r.page,
                      })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Open page ${r.page}`}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: spacing.s3,
                      paddingVertical: spacing.s2,
                      paddingHorizontal: spacing.s2,
                      borderRadius: radius.md,
                      backgroundColor: pressed ? colors.surfaceSecondary : "transparent",
                    })}
                  >
                    <Avatar
                      name={r.user.displayName}
                      imageUri={r.user.avatarUrl}
                      size="md"
                    />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text
                        style={{
                          ...typography.bodyMd,
                          color: colors.textPrimary,
                          fontFamily: "Raleway-SemiBold",
                        }}
                      >
                        {r.user.displayName}{" "}
                        <Text style={{ fontFamily: "Inter-Regular", color: colors.textSecondary }}>
                          reacted on page {r.page}
                        </Text>
                      </Text>
                      <Text style={{ ...typography.bodyMd, color: colors.textPrimary }} numberOfLines={2}>
                        {r.type === "emoji" ? r.emoji : r.text}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )
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

      <BookUploadSheet
        visible={pickedFile !== null}
        clubId={clubId}
        file={pickedFile}
        onClose={() => setPickedFile(null)}
        onUploaded={() => setPickedFile(null)}
      />
    </SafeAreaView>
  );
}
