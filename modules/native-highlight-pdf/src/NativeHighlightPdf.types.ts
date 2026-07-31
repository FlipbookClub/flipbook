import type { StyleProp, ViewStyle } from "react-native";

export type HighlightRect = { x: number; y: number; w: number; h: number };

// An already-persisted highlight, repainted onto the page it belongs to.
export type ExistingHighlight = {
  id: string;
  page: number;
  rects: HighlightRect[];
};

export type DocumentLoadedEventPayload = { totalPages: number };
export type PageChangedEventPayload = { page: number; totalPages: number };
export type SelectionChangedEventPayload = { hasSelection: boolean };
export type HighlightTappedEventPayload = { reactionId: string };
export type LoadErrorEventPayload = { message: string };

// What captureSelection() resolves to — null if there was nothing (valid)
// selected at call time.
export type CapturedSelection = {
  page: number;
  quote: string;
  rects: HighlightRect[];
};

export type NativeHighlightPdfViewProps = {
  style?: StyleProp<ViewStyle>;
  documentUri: string;
  startPage?: number;
  highlights?: ExistingHighlight[];
  onDocumentLoaded?: (event: { nativeEvent: DocumentLoadedEventPayload }) => void;
  onPageChanged?: (event: { nativeEvent: PageChangedEventPayload }) => void;
  onSelectionChanged?: (event: { nativeEvent: SelectionChangedEventPayload }) => void;
  onHighlightTapped?: (event: { nativeEvent: HighlightTappedEventPayload }) => void;
  onLoadError?: (event: { nativeEvent: LoadErrorEventPayload }) => void;
};

// Imperative methods callable via a ref to <NativeHighlightPdfView>.
export interface NativeHighlightPdfViewRef {
  jumpToPage(page: number): Promise<void>;
  clearSelection(): Promise<void>;
  // Captures the current selection's {page, quote, rects} without painting
  // an annotation — see NativeHighlightPdfView.swift's captureSelection()
  // doc comment. iOS-only for now: the Android Kotlin module still exposes
  // the older createHighlightFromSelection/onHighlightCreated shape and
  // hasn't been updated to match this interface (it's not wired into
  // ReaderScreen yet either — see the Android page-turn-gesture gap).
  captureSelection(): Promise<CapturedSelection | null>;
}
