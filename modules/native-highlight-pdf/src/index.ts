import { requireNativeModule } from "expo";

export { NativeHighlightPdfView } from "./NativeHighlightPdfView";
export * from "./NativeHighlightPdf.types";

interface NativeHighlightPdfModule {
  inspectPdf(
    uri: string,
    coverWidth: number,
    coverHeight: number,
  ): Promise<{ pageCount: number; coverUri?: string }>;
}

const nativeModule = requireNativeModule<NativeHighlightPdfModule>("NativeHighlightPdf");

// Opens `uri` directly (no mounted view needed) and returns its page count
// plus a first-page cover thumbnail — used by the upload flow, iOS only.
// Replaces react-native-pdf's off-screen render + react-native-view-shot's
// snapshot (see BookUploadSheet.tsx).
export const inspectPdf = nativeModule.inspectPdf;
