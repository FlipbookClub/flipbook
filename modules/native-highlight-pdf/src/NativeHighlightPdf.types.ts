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
export type HighlightCreatedEventPayload = {
  page: number;
  quote: string;
  rects: HighlightRect[];
};
export type LoadErrorEventPayload = { message: string };

export type NativeHighlightPdfViewProps = {
  style?: StyleProp<ViewStyle>;
  documentUri: string;
  startPage?: number;
  highlights?: ExistingHighlight[];
  onDocumentLoaded?: (event: { nativeEvent: DocumentLoadedEventPayload }) => void;
  onPageChanged?: (event: { nativeEvent: PageChangedEventPayload }) => void;
  onSelectionChanged?: (event: { nativeEvent: SelectionChangedEventPayload }) => void;
  onHighlightCreated?: (event: { nativeEvent: HighlightCreatedEventPayload }) => void;
  onLoadError?: (event: { nativeEvent: LoadErrorEventPayload }) => void;
};

// Imperative methods callable via a ref to <NativeHighlightPdfView>.
export interface NativeHighlightPdfViewRef {
  jumpToPage(page: number): Promise<void>;
  clearSelection(): Promise<void>;
  createHighlightFromSelection(): Promise<void>;
}
