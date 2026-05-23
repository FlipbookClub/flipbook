import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import Pdf from "react-native-pdf";
import { Settings2, Smile, X } from "lucide-react-native";
import { useMutation, useQuery } from "convex/react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { useFocusEffect, type RouteProp } from "@react-navigation/native";

import { MarginReactionsList } from "@/components/features/MarginReactionsList";
import { ReactionDetailsSheet } from "@/components/features/ReactionDetailsSheet";
import { ReactionComposer, type ReactionSubmission } from "@/screens/reader/ReactionComposer";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";
import { ensureCachedPdf, getCachedPdfPath } from "@/lib/pdf";
import {
  PROGRESS_SYNC_INTERVAL_MS,
  readCachedProgress,
  useThrottledCallback,
  writeCachedProgress,
} from "@/lib/progress";
import { readBookMeta, writeBookMeta, type CachedBookMeta } from "@/lib/bookMeta";

import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

// Source-of-truth view the reader actually renders from. Either fresh server
// data (online) or a hydrated local meta cache (offline). Both expose the
// minimum the reader needs without coupling render code to the Convex shape.
interface EffectiveBook {
  source: "server" | "local";
  storageId: Id<"_storage">;
  clubId: Id<"clubs">;
  title: string;
  author: string;
  pageCount: number;
  isRemoved: boolean;
  clubName: string | null;
  // null when we only have local meta (offline) — the reader has to fall
  // back to a previously-cached disk file or surface "not downloaded yet".
  pdfUrl: string | null;
}

// Reader is registered in both CommunityStack and LibraryStack, so type the
// props minimally (just what we use) rather than tying to one stack's params.
// `jumpToPage` lets the Activity tab open the reader at a specific page (TASK-051).
interface Props {
  navigation: {
    goBack: () => void;
    getParent: () => { setOptions: (opts: Record<string, unknown>) => void } | undefined;
  };
  route: RouteProp<
    { Reader: { bookId: Id<"books">; jumpToPage?: number } },
    "Reader"
  >;
}

export function ReaderScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { bookId, jumpToPage } = route.params;
  const data = useQuery(api.books.get, { bookId });

  // Read local meta synchronously on mount so the reader can render offline
  // before any Convex query resolves.
  const localMeta = useMemo<CachedBookMeta | null>(() => readBookMeta(bookId), [bookId]);

  const club = useQuery(
    api.clubs.get,
    data?.book ? { clubId: data.book.clubId } : "skip",
  );

  // Effective view: server when online, local fallback when not. `undefined`
  // means "still loading and no fallback yet" → show spinner. `null` means
  // explicitly not-found / no-access → show the dead-end state.
  const effective = useMemo<EffectiveBook | null | undefined>(() => {
    if (data === undefined) {
      if (!localMeta) return undefined;
      return {
        source: "local",
        storageId: localMeta.storageId as Id<"_storage">,
        clubId: localMeta.clubId as Id<"clubs">,
        title: localMeta.title,
        author: localMeta.author,
        pageCount: localMeta.pageCount,
        isRemoved: localMeta.isRemoved,
        clubName: localMeta.clubName,
        pdfUrl: null,
      };
    }
    if (data === null) return null;
    return {
      source: "server",
      storageId: data.book.pdfStorageId,
      clubId: data.book.clubId,
      title: data.book.title,
      author: data.book.author,
      pageCount: data.book.pdfPageCount,
      isRemoved: data.book.isRemoved,
      clubName: club?.name ?? localMeta?.clubName ?? null,
      pdfUrl: data.pdfUrl,
    };
  }, [data, club, localMeta]);

  const serverProgress = useQuery(
    api.progress.getMine,
    effective?.source === "server" ? { clubId: effective.clubId, bookId } : "skip",
  );
  const updateProgress = useMutation(api.progress.update);

  // Persist book metadata after every successful server fetch so future
  // offline opens have what they need to hydrate without hitting Convex.
  useEffect(() => {
    if (!data?.book) return;
    writeBookMeta({
      bookId,
      storageId: data.book.pdfStorageId,
      clubId: data.book.clubId,
      clubName: club?.name ?? localMeta?.clubName ?? "",
      title: data.book.title,
      author: data.book.author,
      pageCount: data.book.pdfPageCount,
      isRemoved: data.book.isRemoved,
      updatedAt: Date.now(),
    });
  }, [data, club, localMeta, bookId]);

  // Compute the initial page. When the source is server, wait for the
  // serverProgress query so we can take the more recent of {cache, server}.
  // When the source is local (offline), the cache is all we have.
  // A `jumpToPage` route param overrides both — used when deep-linking from
  // the Activity tab to land on a specific reaction's page.
  const initialPage = useMemo(() => {
    if (jumpToPage && jumpToPage >= 1) return jumpToPage;
    if (!effective) return null;
    const cached = readCachedProgress(bookId);
    if (effective.source === "local") {
      return Math.max(1, cached?.page ?? 1);
    }
    if (serverProgress === undefined) return null;
    const cachedAt = cached?.updatedAt ?? 0;
    const serverAt = serverProgress?.updatedAt ?? 0;
    const winner =
      cachedAt > serverAt
        ? cached?.page
        : (serverProgress?.currentPage ?? cached?.page);
    return Math.max(1, winner ?? 1);
  }, [effective, bookId, serverProgress, jumpToPage]);

  const me = useQuery(api.users.me);
  const createReaction = useMutation(api.reactions.create);

  // Hide the bottom tab bar while reading so the Pdf gets the full screen
  // (and so the floating React FAB isn't obscured by the tab strip).
  // Restored on blur / unmount.
  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({ tabBarStyle: { display: "none" } });
      return () => {
        parent?.setOptions({ tabBarStyle: undefined });
      };
    }, [navigation]),
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Set by the cache-resolution effect below once we know the storage ID.
  const [resolvedUri, setResolvedUri] = useState<string | null>(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedReactionId, setSelectedReactionId] = useState<Id<"reactions"> | null>(null);

  // FR-016 hot path. Skip until we know the effective source so we don't
  // fire the query with a missing clubId/bookId during the offline-hydrate
  // window.
  const pageReactions = useQuery(
    api.reactions.listForPage,
    effective && !effective.isRemoved
      ? { clubId: effective.clubId, bookId, page: currentPage }
      : "skip",
  );

  const handleReactionSubmit = async (payload: ReactionSubmission) => {
    if (!effective) return;
    try {
      await createReaction({
        clubId: effective.clubId,
        bookId,
        page: currentPage,
        type: payload.type,
        emoji: payload.emoji,
        text: payload.text,
      });
      // Vision § Motion: subtle light impact when YOUR reaction lands.
      // Best-effort; haptics aren't available on every simulator/device.
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    } catch (err) {
      const code = (err as { data?: { code?: string } })?.data?.code;
      if (code === "rate_limited") {
        // FR edge case: rate-limited
        setLoadError(null);
        // Surface to user via a transient toast in a follow-up — for now
        // swallowing keeps the composer feeling responsive.
      }
    }
  };

  // FR-014: 400ms long-press opens the picker. Using gesture-handler so we
  // coexist with react-native-pdf's internal swipe handlers — quick swipes
  // still page; only a held touch triggers the composer.
  const longPress = Gesture.LongPress()
    .minDuration(400)
    .onStart(() => {
      setComposerOpen(true);
    })
    .runOnJS(true);

  const syncToServer = useThrottledCallback(
    (page: number, total: number) => {
      if (!effective) return;
      updateProgress({
        clubId: effective.clubId,
        bookId,
        currentPage: page,
        totalPages: total,
      }).catch(() => {
        // Best-effort — local cache already has the page; offline mutations
        // will fail here, and the next successful call reconciles state.
      });
    },
    PROGRESS_SYNC_INTERVAL_MS,
  );

  const handlePageChanged = (page: number, total: number) => {
    // react-native-pdf occasionally fires onPageChanged with transient bogus
    // values during paging animations (e.g. page=0 or total=0). Drop those
    // before writing cache or syncing — server validation rejects them too.
    if (!Number.isFinite(page) || !Number.isFinite(total)) return;
    if (page < 1 || total < 1 || page > total) return;
    setCurrentPage(page);
    setTotalPages(total);
    writeCachedProgress({ bookId, page, totalPages: total, updatedAt: Date.now() });
    syncToServer(page, total);
  };

  // Resolve PDF source.
  // - Server source + signed URL → ensure cached on disk, render from there.
  // - Local source (offline) → must rely on a previously-cached disk file;
  //   surface a friendly "not downloaded yet" error if there isn't one.
  // - DMCA takedown is handled in the render path, not here.
  useEffect(() => {
    if (!effective || effective.isRemoved) return;
    const { storageId, pdfUrl } = effective;
    if (pdfUrl === null) {
      const cached = getCachedPdfPath(storageId);
      if (cached) {
        setResolvedUri(cached);
      } else {
        setLoadError(
          "You're offline and this book hasn't been downloaded yet. Connect to the internet to load it.",
        );
      }
      return;
    }
    let cancelled = false;
    ensureCachedPdf(storageId, pdfUrl)
      .then((path) => {
        if (!cancelled) setResolvedUri(path);
      })
      .catch(() => {
        if (!cancelled) setResolvedUri(pdfUrl);
      });
    return () => {
      cancelled = true;
    };
  }, [effective]);

  const { width, height } = Dimensions.get("window");

  if (effective === undefined) {
    return <LoadingState bg={colors.surfacePrimary} fg={colors.textPrimary} />;
  }
  if (effective === null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
        <Header
          title="Book not found"
          subtitle={null}
          onClose={() => navigation.goBack()}
          onSettings={() => setCustomizeOpen(true)}
        />
        <View style={{ flex: 1, padding: spacing.s5, justifyContent: "center" }}>
          <Text style={{ ...typography.bodyLg, color: colors.textPrimary, textAlign: "center" }}>
            This book may have been removed or you don't have access.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (effective.isRemoved) {
    // FR-edge: DMCA / removed-book takedown state.
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
        <Header
          title={effective.title}
          subtitle={effective.clubName}
          onClose={() => navigation.goBack()}
          onSettings={() => setCustomizeOpen(true)}
        />
        <View style={{ flex: 1, padding: spacing.s5, justifyContent: "center", gap: spacing.s3 }}>
          <Text style={{ ...typography.headingMd, color: colors.textPrimary, textAlign: "center" }}>
            This book was removed
          </Text>
          <Text style={{ ...typography.bodyMd, color: colors.textSecondary, textAlign: "center" }}>
            Reach out to the moderator for context.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
      <Header
        title={effective.title}
        subtitle={effective.clubName}
        onClose={() => navigation.goBack()}
        onSettings={() => setCustomizeOpen(true)}
      />
      <View style={{ flex: 1, backgroundColor: colors.surfaceSecondary }}>
        {loadError ? (
          <View style={{ flex: 1, padding: spacing.s5, justifyContent: "center" }}>
            <Text style={{ ...typography.bodyLg, color: palette.error, textAlign: "center" }}>
              {loadError}
            </Text>
          </View>
        ) : initialPage === null || resolvedUri === null ? (
          <LoadingState bg={colors.surfaceSecondary} fg={colors.textPrimary} />
        ) : (
          <GestureDetector gesture={longPress}>
            <View style={{ flex: 1 }}>
              <Pdf
                source={{ uri: resolvedUri, cache: true }}
                horizontal
                enablePaging
                page={initialPage}
                onLoadComplete={(numberOfPages) => {
                  if (!Number.isFinite(numberOfPages) || numberOfPages < 1) return;
                  setTotalPages(numberOfPages);
                  // Sync immediately on first load so the server learns about the
                  // resumed page even if the user closes before scrolling.
                  const startPage = Math.min(Math.max(1, initialPage), numberOfPages);
                  setCurrentPage(startPage);
                  syncToServer(startPage, numberOfPages);
                }}
                onPageChanged={(page, total) => handlePageChanged(page, total)}
                onError={(err) => {
                  setLoadError(typeof err === "string" ? err : "Couldn't open this book.");
                }}
                renderActivityIndicator={() => <ActivityIndicator color={colors.textPrimary} />}
                style={{ flex: 1, width, height: height - 120, backgroundColor: colors.surfaceSecondary }}
                trustAllCerts={false}
              />
              {pageReactions && pageReactions.length > 0 ? (
                <MarginReactionsList
                  reactions={pageReactions}
                  onSelectReaction={setSelectedReactionId}
                />
              ) : null}
            </View>
          </GestureDetector>
        )}
      </View>
      <View
        style={{
          paddingVertical: spacing.s2,
          paddingHorizontal: spacing.s4,
          alignItems: "center",
        }}
      >
        <Text style={{ ...typography.uiLabelMd, color: colors.textMuted }}>
          Page {currentPage}
          {totalPages !== null ? ` of ${totalPages}` : ""}
        </Text>
      </View>
      {/* Floating React button — sibling of the Pdf area, not a child, so
          it's guaranteed to overlay the native PDFKit view. Long-press on
          the Pdf doesn't fire reliably because PDFKit consumes touches at
          the native layer; the FAB is the discoverable fallback. */}
      {resolvedUri && !loadError && initialPage !== null ? (
        <Pressable
          onPress={() => setComposerOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="React to this page"
          hitSlop={spacing.s3}
          style={({ pressed }) => ({
            position: "absolute",
            right: spacing.s4,
            bottom: spacing.s6,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: palette.brandPrimary,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
            elevation: 6,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Smile size={28} color={palette.textOnBrand} />
        </Pressable>
      ) : null}
      <ReaderCustomizationSheet
        visible={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
      />
      <ReactionComposer
        visible={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSubmit={handleReactionSubmit}
      />
      {effective && !effective.isRemoved ? (
        <ReactionDetailsSheet
          visible={selectedReactionId !== null}
          reactionId={selectedReactionId}
          clubId={effective.clubId}
          bookId={bookId}
          page={currentPage}
          currentUserId={me?._id ?? null}
          onClose={() => setSelectedReactionId(null)}
        />
      ) : null}
    </SafeAreaView>
  );
}

interface HeaderProps {
  title: string;
  subtitle: string | null;
  onClose: () => void;
  onSettings: () => void;
  settingsDisabled?: boolean;
}

function Header({ title, subtitle, onClose, onSettings, settingsDisabled }: HeaderProps) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.s4,
        paddingTop: spacing.s2,
        paddingBottom: spacing.s3,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Pressable
        onPress={onClose}
        hitSlop={spacing.s3}
        accessibilityRole="button"
        accessibilityLabel="Close reader"
        style={{ width: 40 }}
      >
        <X size={22} color={colors.textPrimary} />
      </Pressable>
      <View style={{ flex: 1, alignItems: "center", gap: 2 }}>
        <Text
          style={{ ...typography.bodyLg, color: colors.textPrimary, fontFamily: "Raleway-SemiBold" }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ ...typography.bodySm, color: colors.textMuted }} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Pressable
        onPress={onSettings}
        hitSlop={spacing.s3}
        disabled={settingsDisabled}
        accessibilityRole="button"
        accessibilityLabel="Reader settings"
        style={{ width: 40, alignItems: "flex-end" }}
      >
        <Settings2
          size={22}
          color={settingsDisabled ? colors.textMuted : colors.textPrimary}
        />
      </Pressable>
    </View>
  );
}

function ReaderCustomizationSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
        accessibilityLabel="Dismiss sheet"
      />
      <View
        style={{
          backgroundColor: colors.surfacePrimary,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          paddingHorizontal: spacing.s5,
          paddingTop: spacing.s4,
          paddingBottom: spacing.s6,
          gap: spacing.s3,
        }}
      >
        <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>
          Reading customization
        </Text>
        <Text style={{ ...typography.bodyMd, color: colors.textSecondary }}>
          Font, line height, and page background controls are coming with Pro in Phase 6.
        </Text>
      </View>
    </Modal>
  );
}

function LoadingState({ bg, fg }: { bg: string; fg: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={fg} />
    </View>
  );
}
