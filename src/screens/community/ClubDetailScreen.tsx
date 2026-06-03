import { useState } from "react";
import { Alert, Image, Pressable, SafeAreaView, ScrollView, Share, Text, View } from "react-native";
import { BookPlus, ChevronLeft, Settings, Share2 } from "lucide-react-native";
import { useMutation, useQuery } from "convex/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { BlurView } from "expo-blur";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BookCover } from "@/components/features/BookCover";
import { BookUploadSheet } from "@/components/features/BookUploadSheet";
import { ChapterListItem } from "@/components/features/ChapterListItem";
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
type TabKey = "room" | "discussions" | "library";

const DEEP_LINK_BASE = "flipbook://join";

export function ClubDetailScreen({ navigation, route }: Props) {
  const { colors, mode } = useTheme();
  const { clubId } = route.params;
  const club = useQuery(api.clubs.get, { clubId });
  const members = useQuery(api.memberships.listClubMembers, { clubId });
  const books = useQuery(api.books.listForClub, { clubId });
  const chapters = useQuery(api.chapters.list, { clubId });
  const isCreatorClub = club?.type === "creator";
  // The club's active read drives progress + the activity feed. It changes only
  // when the moderator sets it — so uploading a new (library) book no longer
  // makes the feed vanish, and library books don't count toward the feed.
  const currentBook = useQuery(api.books.currentForClub, { clubId });
  const libraryBooks = (books ?? []).filter((b) => b._id !== currentBook?._id);
  const latestChapter = chapters && chapters.length > 0 ? chapters[0] : null;
  const setCurrentlyReading = useMutation(api.books.setCurrentlyReading);
  const moveToLibrary = useMutation(api.books.moveToLibrary);
  const progressRows = useQuery(
    api.progress.listForClub,
    isCreatorClub
      ? latestChapter
        ? { clubId, chapterId: latestChapter._id }
        : "skip"
      : currentBook
        ? { clubId, bookId: currentBook._id }
        : "skip",
  );
  const activity = useQuery(
    api.reactions.listForBook,
    isCreatorClub
      ? latestChapter
        ? { clubId, chapterId: latestChapter._id, limit: 20 }
        : "skip"
      : currentBook
        ? { clubId, bookId: currentBook._id, limit: 20 }
        : "skip",
  );
  const me = useQuery(api.users.me);

  const [tab, setTab] = useState<TabKey>("room");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pickedFile, setPickedFile] = useState<PickedPdf | null>(null);

  const isModerator = !!me && !!club && club.moderatorId === me._id;
  // FR-075: when previewing a public club from Discovery without having
  // joined, the user can see the club but the Activity tab's reactions
  // should be blurred until they join.
  const isMember =
    isModerator || (!!me && !!members && members.some((m) => m.userId === me._id));
  const canUpload =
    !isCreatorClub &&
    (isModerator || (!!club && club.permissions.membersCanUploadBooks));
  // FR: members can edit community info when the moderator grants it. They get
  // the edit page (info only); the moderator gets the full manage sheet.
  const canEditInfo =
    isModerator || (isMember && !!club && club.permissions.membersCanUpdateInfo);
  // Each member's progress on the current book, for the Room-lobby members list.
  const progressByUser = new Map((progressRows ?? []).map((p) => [p.userId, p] as const));
  const inviteUrl = club ? `${DEEP_LINK_BASE}/${club.inviteCode}` : null;
  const joinByCode = useMutation(api.memberships.joinByCode);
  const [joining, setJoining] = useState(false);
  const handleJoinFromPreview = async () => {
    if (!club || joining) return;
    setJoining(true);
    try {
      await joinByCode({ inviteCode: club.inviteCode });
    } catch (err) {
      const code = (err as { data?: { code?: string } })?.data?.code;
      Alert.alert(
        "Can't join",
        code === "pro_required"
          ? "You're at the 3-club limit on the free tier. Flipbook Pro will lift the cap — coming soon."
          : code ?? "Try again in a moment.",
      );
    } finally {
      setJoining(false);
    }
  };

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "room", label: "Room lobby" },
    { key: "discussions", label: "Discussions" },
    { key: "library", label: isCreatorClub ? "Chapters" : "Library" },
  ];

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
          {canEditInfo ? (
            <Pressable
              onPress={() =>
                isModerator
                  ? setSheetOpen(true)
                  : navigation.navigate("EditCommunity", { clubId })
              }
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
                // Emblem box is surfaceSecondary, so the initial uses textAlt
                // (the on-secondary token) — readable in Light/Flip/Dark.
                <Text style={{ fontFamily: "Raleway-Bold", fontSize: 28, color: colors.textAlt }}>
                  {club.name.slice(0, 1).toUpperCase()}
                </Text>
              )}
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
            {tabs.map((t) => (
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
          {tab === "library" ? (
            isCreatorClub ? (
              chapters && chapters.length > 0 ? (
                <View style={{ gap: spacing.s3 }}>
                  {chapters.map((c) => (
                    <ChapterListItem
                      key={c._id}
                      chapterNumber={c.chapterNumber}
                      title={c.title}
                      publishedAt={c.publishedAt}
                      pageCount={c.pdfPageCount}
                      onPress={() => navigation.navigate("Reader", { chapterId: c._id })}
                    />
                  ))}
                  {isModerator ? (
                    <Button
                      label="Publish next chapter"
                      variant="secondary"
                      fullWidth
                      onPress={() => navigation.navigate("PublishChapter", { clubId })}
                    />
                  ) : null}
                </View>
              ) : (
                <Card>
                  <View style={{ gap: spacing.s3, alignItems: "center", paddingVertical: spacing.s3 }}>
                    <Text style={{ ...typography.bodyLg, color: colors.textPrimary, fontFamily: "Raleway-SemiBold" }}>
                      No chapters yet
                    </Text>
                    <Text style={{ ...typography.bodySm, color: colors.textMuted, textAlign: "center" }}>
                      {isModerator
                        ? "Drop your first chapter. Followers get a push."
                        : "Waiting on the author to drop the first chapter."}
                    </Text>
                    {isModerator ? (
                      <Button
                        label="Publish chapter"
                        onPress={() => navigation.navigate("PublishChapter", { clubId })}
                        leadingIcon={<BookPlus size={18} color={palette.textOnBrand} />}
                      />
                    ) : null}
                  </View>
                </Card>
              )
            ) : books && books.length > 0 ? (
              <View style={{ gap: spacing.s5 }}>
                {currentBook ? (
                  <View style={{ gap: spacing.s3 }}>
                    <Text style={{ ...typography.overlineLg, color: colors.textPrimary }}>
                      Currently reading
                    </Text>
                    <View style={{ flexDirection: "row", gap: spacing.s4 }}>
                      <BookCover
                        title={currentBook.title}
                        author={currentBook.author}
                        pageCount={currentBook.pdfPageCount}
                        size="sm"
                        onPress={() => navigation.navigate("Reader", { bookId: currentBook._id })}
                      />
                      <View style={{ flex: 1, gap: spacing.s1 }}>
                        <Text
                          style={{ ...typography.bodyLg, fontFamily: "Raleway-SemiBold", color: colors.textPrimary }}
                          numberOfLines={2}
                        >
                          {currentBook.title}
                        </Text>
                        <Text style={{ ...typography.bodySm, color: colors.textMuted }}>
                          {currentBook.author}
                        </Text>
                        {isModerator ? (
                          <Pressable
                            onPress={() =>
                              moveToLibrary({ bookId: currentBook._id }).catch(() =>
                                Alert.alert("Couldn't update", "Please try again."),
                              )
                            }
                            hitSlop={spacing.s2}
                            accessibilityRole="button"
                          >
                            <Text style={{ ...typography.bodySm, color: colors.textAccent, fontFamily: "Raleway-SemiBold" }}>
                              Move to library
                            </Text>
                          </Pressable>
                        ) : null}
                      </View>
                    </View>
                    <ProgressVisualization
                      rows={progressRows?.map((p) => ({
                        userId: p.userId,
                        displayName: p.user.displayName,
                        avatarUrl: p.user.avatarUrl,
                        currentPage: p.currentPage,
                        totalPages: p.totalPages,
                      }))}
                      bookTitle={currentBook.title}
                    />
                  </View>
                ) : isModerator ? (
                  <Card>
                    <View style={{ gap: spacing.s2, paddingVertical: spacing.s2 }}>
                      <Text style={{ ...typography.bodyMd, color: colors.textPrimary, fontFamily: "Raleway-SemiBold" }}>
                        No current read
                      </Text>
                      <Text style={{ ...typography.bodySm, color: colors.textMuted }}>
                        Pick a book from the library below and set it as currently reading.
                      </Text>
                    </View>
                  </Card>
                ) : null}

                {libraryBooks.length > 0 ? (
                  <View style={{ gap: spacing.s3 }}>
                    <Text style={{ ...typography.overlineLg, color: colors.textPrimary }}>Library</Text>
                    {libraryBooks.map((b) => (
                      <View key={b._id} style={{ flexDirection: "row", gap: spacing.s4 }}>
                        <BookCover
                          title={b.title}
                          author={b.author}
                          pageCount={b.pdfPageCount}
                          size="sm"
                          onPress={() => navigation.navigate("Reader", { bookId: b._id })}
                        />
                        <View style={{ flex: 1, gap: spacing.s1 }}>
                          <Text
                            style={{ ...typography.bodyMd, fontFamily: "Raleway-SemiBold", color: colors.textPrimary }}
                            numberOfLines={2}
                          >
                            {b.title}
                          </Text>
                          <Text style={{ ...typography.bodySm, color: colors.textMuted }}>{b.author}</Text>
                          {isModerator ? (
                            <Pressable
                              onPress={() =>
                                setCurrentlyReading({ bookId: b._id }).catch(() =>
                                  Alert.alert("Couldn't update", "Please try again."),
                                )
                              }
                              hitSlop={spacing.s2}
                              accessibilityRole="button"
                            >
                              <Text style={{ ...typography.bodySm, color: colors.textAccent, fontFamily: "Raleway-SemiBold" }}>
                                Set as currently reading
                              </Text>
                            </Pressable>
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}

                {canUpload ? (
                  <Button label="Add another book" variant="primary" fullWidth onPress={handleAddBook} />
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
          ) : tab === "discussions" ? (
            !isMember ? (
              // FR-075 / US-012: preview safety. Public clubs are visible to
              // non-members from Discovery, but reactions stay locked behind
              // a soft blur with a Join CTA — sells the join without leaking
              // anyone's commentary.
              <View style={{ gap: spacing.s3 }}>
                <View style={{ position: "relative", borderRadius: radius.md, overflow: "hidden" }}>
                  <View style={{ gap: spacing.s2 }}>
                    {[0, 1, 2, 3].map((i) => (
                      <View
                        key={i}
                        style={{
                          flexDirection: "row",
                          gap: spacing.s3,
                          paddingVertical: spacing.s2,
                          paddingHorizontal: spacing.s2,
                        }}
                      >
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: colors.surfaceSecondary,
                          }}
                        />
                        <View style={{ flex: 1, gap: spacing.s1 }}>
                          <View
                            style={{
                              height: 12,
                              borderRadius: 6,
                              width: "60%",
                              backgroundColor: colors.surfaceSecondary,
                            }}
                          />
                          <View
                            style={{
                              height: 10,
                              borderRadius: 5,
                              width: "85%",
                              backgroundColor: colors.surfaceSecondary,
                              opacity: 0.7,
                            }}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                  <BlurView
                    intensity={28}
                    tint={mode === "dark" ? "dark" : "light"}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  />
                </View>
                <Card>
                  <View style={{ gap: spacing.s2, alignItems: "center", paddingVertical: spacing.s2 }}>
                    <Text
                      style={{
                        ...typography.bodyLg,
                        color: colors.textPrimary,
                        fontFamily: "Raleway-SemiBold",
                        textAlign: "center",
                      }}
                    >
                      Join to see what people are saying
                    </Text>
                    <Text style={{ ...typography.bodySm, color: colors.textMuted, textAlign: "center" }}>
                      Reactions and replies unlock when you become a member.
                    </Text>
                    <Button
                      label={joining ? "Joining…" : "Join community"}
                      onPress={handleJoinFromPreview}
                      disabled={joining}
                    />
                  </View>
                </Card>
              </View>
            ) : !(isCreatorClub ? latestChapter : currentBook) ? (
              <Card>
                <View style={{ gap: spacing.s2, alignItems: "center", paddingVertical: spacing.s3 }}>
                  <Text style={{ ...typography.bodyLg, color: colors.textPrimary, fontFamily: "Raleway-SemiBold" }}>
                    Quiet for now
                  </Text>
                  <Text style={{ ...typography.bodySm, color: colors.textMuted, textAlign: "center" }}>
                    {isCreatorClub
                      ? "Once the first chapter drops, reactions show up here."
                      : "Once a book is open, reactions show up here in real time."}
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
                      navigation.navigate(
                        "Reader",
                        isCreatorClub && latestChapter
                          ? { chapterId: latestChapter._id, jumpToPage: r.page }
                          : currentBook
                            ? { bookId: currentBook._id, jumpToPage: r.page }
                            : { jumpToPage: r.page },
                      )
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
            // Room lobby: the current read at a glance + members' progress.
            <View style={{ gap: spacing.s5 }}>
              {currentBook ? (
                <View style={{ gap: spacing.s2 }}>
                  <Text style={{ ...typography.overlineLg, color: colors.textPrimary }}>
                    Currently reading
                  </Text>
                  <Pressable
                    onPress={() => navigation.navigate("Reader", { bookId: currentBook._id })}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${currentBook.title}`}
                    style={{
                      flexDirection: "row",
                      gap: spacing.s4,
                      padding: spacing.s3,
                      borderRadius: radius.md,
                      backgroundColor: colors.surfaceSecondary,
                    }}
                  >
                    <BookCover
                      title={currentBook.title}
                      author={currentBook.author}
                      pageCount={currentBook.pdfPageCount}
                      size="sm"
                    />
                    <View style={{ flex: 1, gap: spacing.s1 }}>
                      <Text
                        style={{ ...typography.bodyLg, fontFamily: "Raleway-SemiBold", color: colors.textPrimary }}
                        numberOfLines={2}
                      >
                        {currentBook.title}
                      </Text>
                      <Text style={{ ...typography.bodySm, color: colors.textMuted }}>
                        Author{" "}
                        <Text style={{ color: colors.textAccent, fontFamily: "Raleway-SemiBold" }}>
                          {currentBook.author}
                        </Text>
                      </Text>
                      {currentBook.currentlyReadingAt ? (
                        <Text style={{ ...typography.uiLabelMd, color: colors.textMuted }}>
                          Started {new Date(currentBook.currentlyReadingAt).toLocaleDateString()}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                </View>
              ) : null}

              <View style={{ gap: spacing.s2 }}>
                <Text style={{ ...typography.overlineLg, color: colors.textPrimary }}>
                  Club members
                </Text>
                {members?.map((m) => {
                  const p = progressByUser.get(m.userId);
                  const pct =
                    p && p.totalPages > 0
                      ? Math.min(100, Math.round((p.currentPage / p.totalPages) * 100))
                      : 0;
                  return (
                    <View
                      key={m._id}
                      style={{ flexDirection: "row", alignItems: "center", gap: spacing.s3, paddingVertical: spacing.s2 }}
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
                        {m.role === "moderator" ? (
                          <Text style={{ ...typography.bodySm, color: colors.textAccent }}>Moderator</Text>
                        ) : null}
                      </View>
                      <View style={{ width: 96, gap: 4, alignItems: "flex-end" }}>
                        <Text style={{ ...typography.uiLabelMd, color: colors.textMuted }}>
                          {p ? `${p.currentPage} of ${p.totalPages} pages` : "Not started"}
                        </Text>
                        <View style={{ height: 3, width: "100%", borderRadius: 2, backgroundColor: colors.surfaceSecondary }}>
                          <View
                            style={{
                              width: `${pct}%`,
                              height: 3,
                              borderRadius: 2,
                              backgroundColor: palette.accentStrong,
                            }}
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
                {members?.length === 0 ? (
                  <Text style={{ ...typography.bodySm, color: colors.textMuted, textAlign: "center" }}>
                    No members yet.
                  </Text>
                ) : null}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {isModerator ? (
        <ClubModeratorSheet
          visible={sheetOpen}
          club={club}
          onClose={() => setSheetOpen(false)}
          onEdit={() => navigation.navigate("EditCommunity", { clubId })}
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
