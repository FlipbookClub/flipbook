import { useEffect, useMemo, useState } from "react";
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
import { Settings2, X } from "lucide-react-native";
import { useMutation, useQuery } from "convex/react";
import type { RouteProp } from "@react-navigation/native";

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
interface Props {
  navigation: { goBack: () => void };
  route: RouteProp<{ Reader: { bookId: Id<"books"> } }, "Reader">;
}

export function ReaderScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { bookId } = route.params;
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
  const initialPage = useMemo(() => {
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
  }, [effective, bookId, serverProgress]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Set by the cache-resolution effect below once we know the storage ID.
  const [resolvedUri, setResolvedUri] = useState<string | null>(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);

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
      <ReaderCustomizationSheet
        visible={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
      />
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
