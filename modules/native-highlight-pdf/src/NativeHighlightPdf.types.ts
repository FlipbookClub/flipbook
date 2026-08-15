import type { StyleProp, ViewStyle } from "react-native";

export type HighlightRect = { x: number; y: number; w: number; h: number };

// An already-persisted highlight, painted onto the page it belongs to via
// addHighlight().
export type ExistingHighlight = {
  id: string;
  page: number;
  rects: HighlightRect[];
};

export type PageChangedEventPayload = { page: number; totalPages: number };
export type SelectionChangedEventPayload = { hasSelection: boolean };
export type HighlightTappedEventPayload = { reactionId: string };

// What captureSelection() resolves to — null if there was nothing (valid)
// selected at call time.
export type CapturedSelection = {
  page: number;
  quote: string;
  rects: HighlightRect[];
};

export type DisplayMode = "paged" | "scroll";

export type NativeHighlightPdfViewProps = {
  style?: StyleProp<ViewStyle>;
  onPageChanged?: (event: { nativeEvent: PageChangedEventPayload }) => void;
  onSelectionChanged?: (event: { nativeEvent: SelectionChangedEventPayload }) => void;
  onHighlightTapped?: (event: { nativeEvent: HighlightTappedEventPayload }) => void;
};

// Imperative methods callable via a ref to <NativeHighlightPdfView>. This
// view is command-driven, not prop-driven: JS opens the document once and
// thereafter only listens to onPageChanged — PDFKit owns scroll position
// from that point on. See NativeHighlightPdfView.swift's top-of-file comment
// for why (four rounds of reactive-prop bugs, replaced by this).
export interface NativeHighlightPdfViewRef {
  // Opens `uri` and jumps to `startPage` in one call. Rejects if the file
  // can't be resolved or isn't a valid PDF.
  openDocument(
    uri: string,
    startPage: number,
    displayMode: DisplayMode,
  ): Promise<{ totalPages: number; startPage: number }>;
  setDisplayMode(mode: DisplayMode): Promise<void>;
  jumpToPage(page: number): Promise<void>;
  // Paints one highlight's annotations. Safe to call for a highlight that's
  // already painted (replaces it) — never disturbs scroll position.
  addHighlight(highlight: ExistingHighlight): Promise<void>;
  removeHighlight(id: string, page: number): Promise<void>;
  clearSelection(): Promise<void>;
  // Captures the current selection's {page, quote, rects} without painting
  // an annotation — see NativeHighlightPdfView.swift's captureSelection()
  // doc comment. iOS-only for now: the Android Kotlin module still exposes
  // the older createHighlightFromSelection/onHighlightCreated shape and
  // hasn't been updated to match this interface (it's not wired into
  // ReaderScreen yet either — see the Android page-turn-gesture gap).
  captureSelection(): Promise<CapturedSelection | null>;
}
