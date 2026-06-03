import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { Settings2, Smile, X } from "@/lib/icons";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { useFocusEffect, type RouteProp } from "@react-navigation/native";

import { MarginReactionsList } from "@/components/features/MarginReactionsList";
import {
  PdfWebView,
  type PdfWebViewHandle,
  type SelectionPayload,
} from "@/components/features/PdfWebView";
import { ReactionDetailsSheet } from "@/components/features/ReactionDetailsSheet";
import { ReactionComposer, type ReactionSubmission } from "@/screens/reader/ReactionComposer";
import { palette } from "@/theme/palette";
import { radius, spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/ThemeContext";
import { typography } from "@/theme/typography";
import { ensureCachedPdf, getCachedPdfPath } from "@/lib/pdf";
import {
  PROGRESS_SYNC_INTERVAL_MS,
  readCachedProgress,
  useThrottledCallback,
  writeCachedProgress,
} from "@/lib/progress";
import {
  readContentMeta,
  writeContentMeta,
  type CachedContentMeta,
  type ContentKind,
} from "@/lib/bookMeta";
import { analytics } from "@/lib/analytics";
import { storage } from "@/lib/storage";
import { useConnectivity } from "@/lib/connectivity";
import { enqueueReaction } from "@/lib/reactionQueue";

import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

// Source-of-truth view the reader renders from. Server data online, hydrated
// from local meta cache offline. Both books and chapters land here.
interface EffectiveContent {
  source: "server" | "local";
  kind: ContentKind;
  contentId: Id<"books"> | Id<"chapters">;
  storageId: Id<"_storage">;
  clubId: Id<"clubs">;
  title: string;
  pageCount: number;
  isRemoved: boolean;
  clubName: string | null;
  // null when we only have local meta (offline) — the reader falls back to
  // a previously-cached disk file or surfaces "not downloaded yet".
  pdfUrl: string | null;
}

// Reader is registered in both CommunityStack and LibraryStack. Accept either
// a bookId or chapterId (exactly one); jumpToPage deep-links from Activity.
type ReaderRouteParams = {
  bookId?: Id<"books">;
  chapterId?: Id<"chapters">;
  jumpToPage?: number;
};

interface Props {
  navigation: {
    goBack: () => void;
    getParent: () => { setOptions: (opts: Record<string, unknown>) => void } | undefined;
  };
  route: RouteProp<{ Reader: ReaderRouteParams }, "Reader">;
}

export function ReaderScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { bookId, chapterId, jumpToPage } = route.params;

  const kind: ContentKind | null = bookId ? "book" : chapterId ? "chapter" : null;
  const contentId = (bookId ?? chapterId) as Id<"books"> | Id<"chapters"> | undefined;

  const bookData = useQuery(api.books.get, bookId ? { bookId } : "skip");
  const chapterData = useQuery(
    api.chapters.get,
    chapterId ? { chapterId } : "skip",
  );

  // Read local meta synchronously on mount so the reader can render offline
  // before any Convex query resolves.
  const localMeta = useMemo<CachedContentMeta | null>(
    () => (contentId ? readContentMeta(contentId) : null),
    [contentId],
  );

  // Effective view: server when online, local fallback when not.
  // `undefined` → still loading (spinner). `null` → not found / no access.
  const data = kind === "book" ? bookData : chapterData;
  const club = useQuery(
    api.clubs.get,
    bookData?.book
      ? { clubId: bookData.book.clubId }
      : chapterData?.chapter
        ? { clubId: chapterData.chapter.clubId }
        : "skip",
  );

  const effective = useMemo<EffectiveContent | null | undefined>(() => {
    if (!kind || !contentId) return null;
    if (data === undefined) {
      if (!localMeta) return undefined;
      return {
        source: "local",
        kind: localMeta.kind,
        contentId,
        storageId: localMeta.storageId as Id<"_storage">,
        clubId: localMeta.clubId as Id<"clubs">,
        title: localMeta.title,
        pageCount: localMeta.pageCount,
        isRemoved: localMeta.isRemoved,
        clubName: localMeta.clubName,
        pdfUrl: null,
      };
    }
    if (data === null) return null;
    if (kind === "book" && bookData) {
      return {
        source: "server",
        kind: "book",
        contentId: bookData.book._id,
        storageId: bookData.book.pdfStorageId,
        clubId: bookData.book.clubId,
        title: bookData.book.title,
        pageCount: bookData.book.pdfPageCount,
        isRemoved: bookData.book.isRemoved,
        clubName: club?.name ?? localMeta?.clubName ?? null,
        pdfUrl: bookData.pdfUrl,
      };
    }
    if (kind === "chapter" && chapterData) {
      return {
        source: "server",
        kind: "chapter",
        contentId: chapterData.chapter._id,
        storageId: chapterData.chapter.pdfStorageId,
        clubId: chapterData.chapter.clubId,
        title: `Ch. ${chapterData.chapter.chapterNumber} — ${chapterData.chapter.title}`,
        pageCount: chapterData.chapter.pdfPageCount,
        isRemoved: false,
        clubName: club?.name ?? localMeta?.clubName ?? null,
        pdfUrl: chapterData.pdfUrl,
      };
    }
    return undefined;
  }, [kind, contentId, data, bookData, chapterData, club, localMeta]);

  const serverProgress = useQuery(
    api.progress.getMine,
    effective?.source === "server"
      ? effective.kind === "book"
        ? { clubId: effective.clubId, bookId: effective.contentId as Id<"books"> }
        : { clubId: effective.clubId, chapterId: effective.contentId as Id<"chapters"> }
      : "skip",
  );
  const updateProgress = useMutation(api.progress.update);

  // Persist content metadata after every successful server fetch so future
  // offline opens have what they need to hydrate without hitting Convex.
  useEffect(() => {
    if (!effective || effective.source !== "server" || !contentId) return;
    writeContentMeta({
      kind: effective.kind,
      contentId,
      storageId: effective.storageId,
      clubId: effective.clubId,
      clubName: effective.clubName ?? "",
      title: effective.title,
      pageCount: effective.pageCount,
      isRemoved: effective.isRemoved,
      updatedAt: Date.now(),
    });
  }, [effective, contentId]);

  // Compute the initial page. When the source is server, wait for the
  // serverProgress query so we can take the more recent of {cache, server}.
  // When the source is local (offline), the cache is all we have.
  // A `jumpToPage` route param overrides both — used when deep-linking from
  // the Activity tab or a chapter-drop notification.
  const initialPage = useMemo(() => {
    if (jumpToPage && jumpToPage >= 1) return jumpToPage;
    if (!effective || !contentId) return null;
    const cached = readCachedProgress(contentId);
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
  }, [effective, contentId, serverProgress, jumpToPage]);

  const me = useQuery(api.users.me);
  const createReaction = useMutation(api.reactions.create);
  const { isOnline } = useConnectivity();

  // Hide the bottom tab bar while reading so the Pdf gets the full screen
  // (and so the floating React FAB isn't obscured by the tab strip).
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

  // Freeze the page we open at. `initialPage` recomputes whenever the live
  // serverProgress query updates (including right after our own syncToServer
  // write) — feeding that into the Pdf's controlled `page` prop made it jump
  // back. Capture it once; onPageChanged drives everything after.
  const openAtPageRef = useRef<number | null>(null);
  if (openAtPageRef.current === null && initialPage !== null) {
    openAtPageRef.current = initialPage;
  }

  // Reading view: page-by-page (horizontal paging) or continuous vertical
  // scroll. Persisted so it sticks across books/sessions.
  const [pageMode, setPageMode] = useState<"paged" | "scroll">(() =>
    storage.getString("reader.pageMode") === "scroll" ? "scroll" : "paged",
  );
  const setReadingMode = (mode: "paged" | "scroll") => {
    setPageMode(mode);
    storage.set("reader.pageMode", mode);
  };
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedReactionId, setSelectedReactionId] = useState<Id<"reactions"> | null>(null);
  const webViewRef = useRef<PdfWebViewHandle>(null);
  // Live text selection from the WebView, and the anchor captured when the user
  // opens the composer for it (held separately so it survives the selection
  // clearing while the composer is open).
  const [selection, setSelection] = useState<SelectionPayload | null>(null);
  const [pendingHighlight, setPendingHighlight] = useState<SelectionPayload | null>(null);

  // Build the scope payload once — used in three places (reactions query,
  // reaction submit, reaction details sheet).
  const scopePayload = effective
    ? effective.kind === "book"
      ? { bookId: effective.contentId as Id<"books"> }
      : { chapterId: effective.contentId as Id<"chapters"> }
    : null;

  // FR-016 hot path. Skip until we know the effective source.
  const pageReactions = useQuery(
    api.reactions.listForPage,
    effective && !effective.isRemoved && scopePayload
      ? { clubId: effective.clubId, ...scopePayload, page: currentPage }
      : "skip",
  );

  // All text-anchored highlights for this content, painted across pages in the
  // WebView. Kept in a ref so we can re-push on (re)load when the bridge exists.
  const highlights = useQuery(
    api.reactions.listHighlights,
    effective && !effective.isRemoved && scopePayload
      ? { clubId: effective.clubId, ...scopePayload }
      : "skip",
  );
  const highlightsRef = useRef(highlights);
  highlightsRef.current = highlights;
  useEffect(() => {
    if (highlights) webViewRef.current?.setHighlights(highlights);
  }, [highlights]);

  const handleReactionSubmit = async (payload: ReactionSubmission) => {
    if (!effective || !scopePayload) return;
    // Anchor to the captured text selection if the composer was opened for one;
    // otherwise it's a plain page-level reaction on the current page.
    const anchor = pendingHighlight;
    const args = {
      clubId: effective.clubId,
      ...scopePayload,
      page: anchor ? anchor.page : currentPage,
      type: payload.type,
      emoji: payload.emoji,
      text: payload.text,
      highlightQuote: anchor?.quote,
      highlightRects: anchor?.rects,
    };
    if (anchor) {
      setPendingHighlight(null);
      setSelection(null);
      webViewRef.current?.clearSelection();
    }
    // FR-013 / FR-016 edge case: offline reactions queue locally and sync
    // on reconnect. The flush worker in RootNavigator drains the queue.
    if (!isOnline) {
      enqueueReaction({
        clubId: args.clubId,
        bookId: scopePayload.bookId,
        chapterId: scopePayload.chapterId,
        page: args.page,
        type: args.type,
        emoji: args.emoji,
        text: args.text,
        highlightQuote: args.highlightQuote,
        highlightRects: args.highlightRects,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      return;
    }
    try {
      await createReaction(args);
      analytics.track("reaction_added", { type: payload.type });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    } catch (err) {
      const code = (err as { data?: { code?: string } })?.data?.code;
      // Network-y failures get queued for retry; server-side rejections
      // (rate limited, validation) are surfaced and not retried.
      if (!code) {
        enqueueReaction({
          clubId: args.clubId,
          bookId: scopePayload.bookId,
          chapterId: scopePayload.chapterId,
          page: args.page,
          type: args.type,
          emoji: args.emoji,
          text: args.text,
          highlightQuote: args.highlightQuote,
          highlightRects: args.highlightRects,
        });
      }
    }
  };

  const syncToServer = useThrottledCallback(
    (page: number, total: number) => {
      if (!effective || !scopePayload) return;
      updateProgress({
        clubId: effective.clubId,
        ...scopePayload,
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
    if (!Number.isFinite(page) || !Number.isFinite(total)) return;
    if (page < 1 || total < 1 || page > total) return;
    if (!contentId) return;
    setCurrentPage(page);
    setTotalPages(total);
    writeCachedProgress({ bookId: contentId, page, totalPages: total, updatedAt: Date.now() });
    syncToServer(page, total);
  };

  // Resolve PDF source — cached file when available, fresh signed URL on miss.
  useEffect(() => {
    if (!effective || effective.isRemoved) return;
    const { storageId, pdfUrl } = effective;
    if (pdfUrl === null) {
      const cached = getCachedPdfPath(storageId);
      if (cached) {
        setResolvedUri(cached);
      } else {
        setLoadError(
          "You're offline and this hasn't been downloaded yet. Connect to the internet to load it.",
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

  if (!kind) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
        <Header
          title="Nothing to read"
          subtitle={null}
          onClose={() => navigation.goBack()}
          onSettings={() => undefined}
          settingsDisabled
        />
      </SafeAreaView>
    );
  }
  if (effective === undefined) {
    return <LoadingState bg={colors.surfacePrimary} fg={colors.textPrimary} />;
  }
  if (effective === null) {
    const noun = kind === "chapter" ? "Chapter" : "Book";
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfacePrimary }}>
        <Header
          title={`${noun} not found`}
          subtitle={null}
          onClose={() => navigation.goBack()}
          onSettings={() => setCustomizeOpen(true)}
        />
        <View style={{ flex: 1, padding: spacing.s5, justifyContent: "center" }}>
          <Text style={{ ...typography.bodyLg, color: colors.textPrimary, textAlign: "center" }}>
            This may have been removed or you don't have access.
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
            This was removed
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
      <View style={{ flex: 1 }}>
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
          <PdfWebView
            ref={webViewRef}
            pdfUrl={resolvedUri}
            startPage={Math.max(1, openAtPageRef.current ?? initialPage)}
            bg={colors.surfaceSecondary}
            fg={colors.textPrimary}
            onLoaded={(total) => {
              if (!Number.isFinite(total) || total < 1) return;
              setTotalPages(total);
              const startPage = Math.min(Math.max(1, openAtPageRef.current ?? initialPage), total);
              setCurrentPage(startPage);
              syncToServer(startPage, total);
              // Bridge exists now — (re)paint highlights that resolved earlier.
              if (highlightsRef.current) webViewRef.current?.setHighlights(highlightsRef.current);
            }}
            onPage={(page, total) => handlePageChanged(page, total)}
            onSelection={(s) => setSelection(s)}
            onSelectionCleared={() => setSelection(null)}
            onHighlightTap={(id) => setSelectedReactionId(id as Id<"reactions">)}
            onError={(message) =>
              setLoadError(message || "The pages aren't loading. Mind trying again in a moment?")
            }
          />
        )}
      </View>
      {/* Reaction overlay — rendered as a SIBLING of the Pdf container (not a
          child) so it draws above the native PDFKit view (the same trick the
          React FAB uses). It sits inside this flex wrapper, below the header
          and above the page indicator. */}
      {pageReactions && pageReactions.length > 0 && !loadError && resolvedUri && initialPage !== null ? (
        <MarginReactionsList
          reactions={pageReactions}
          onSelectReaction={setSelectedReactionId}
          authorUserId={club?.type === "creator" ? club.moderatorId : null}
        />
      ) : null}
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
      {/* When text is selected in the reader, offer to anchor a reaction to it.
          Sits above the page-level FAB. */}
      {selection && !loadError ? (
        <Pressable
          onPress={() => {
            setPendingHighlight(selection);
            setComposerOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="React to the selected text"
          style={{
            position: "absolute",
            left: spacing.s4,
            right: spacing.s4 + 64,
            bottom: spacing.s6 + 8,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.s2,
            paddingVertical: spacing.s3,
            paddingHorizontal: spacing.s4,
            borderRadius: radius.pill,
            backgroundColor: palette.brandPrimary,
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Smile size={20} color={palette.textOnBrand} />
          <Text
            style={{ ...typography.bodyMd, color: palette.textOnBrand, fontFamily: "Raleway-SemiBold", flex: 1 }}
            numberOfLines={1}
          >
            React to “{selection.quote}”
          </Text>
        </Pressable>
      ) : null}
      {/* Floating React button — sibling of the Pdf area, not a child, so
          it's guaranteed to overlay the WebView. Page-level reaction. */}
      {resolvedUri && !loadError && initialPage !== null ? (
        <Pressable
          onPress={() => {
            setPendingHighlight(null);
            setComposerOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="React to this page"
          hitSlop={spacing.s3}
          // Static style (not the `({pressed}) => …` callback form): under
          // reanimated 4 the callback silently drops backgroundColor, which
          // left the FAB invisible (white icon only) — notably in light mode.
          style={{
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
          }}
        >
          <Smile size={28} color={palette.textOnBrand} />
        </Pressable>
      ) : null}
      <ReaderCustomizationSheet
        visible={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        pageMode={pageMode}
        onChangeMode={setReadingMode}
      />
      <ReactionComposer
        visible={composerOpen}
        onClose={() => {
          setComposerOpen(false);
          setPendingHighlight(null);
        }}
        onSubmit={handleReactionSubmit}
      />
      {effective && !effective.isRemoved && scopePayload ? (
        <ReactionDetailsSheet
          visible={selectedReactionId !== null}
          reactionId={selectedReactionId}
          clubId={effective.clubId}
          scope={scopePayload}
          page={currentPage}
          currentUserId={me?._id ?? null}
          authorUserId={club?.type === "creator" ? club.moderatorId : null}
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
  pageMode,
  onChangeMode,
}: {
  visible: boolean;
  onClose: () => void;
  pageMode: "paged" | "scroll";
  onChangeMode: (mode: "paged" | "scroll") => void;
}) {
  const { colors } = useTheme();
  const options: Array<{ key: "paged" | "scroll"; label: string }> = [
    { key: "paged", label: "Page by page" },
    { key: "scroll", label: "Continuous scroll" },
  ];
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
          gap: spacing.s4,
        }}
      >
        <Text style={{ ...typography.headingMd, color: colors.textPrimary }}>
          Reading customization
        </Text>

        <View style={{ gap: spacing.s2 }}>
          <Text style={{ ...typography.overlineLg, color: colors.textPrimary }}>Reading view</Text>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: colors.surfaceSecondary,
              borderRadius: radius.pill,
              padding: 4,
            }}
          >
            {options.map((o) => {
              const active = pageMode === o.key;
              return (
                <Pressable
                  key={o.key}
                  onPress={() => onChangeMode(o.key)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={{
                    flex: 1,
                    paddingVertical: spacing.s2,
                    alignItems: "center",
                    borderRadius: radius.pill,
                    backgroundColor: active ? colors.surfacePrimary : "transparent",
                  }}
                >
                  <Text
                    style={{
                      ...typography.bodyMd,
                      fontFamily: "Raleway-SemiBold",
                      color: active ? colors.textPrimary : colors.textMuted,
                    }}
                  >
                    {o.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Text style={{ ...typography.bodySm, color: colors.textMuted }}>
          Font, line height, and page background controls are coming with Pro.
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
