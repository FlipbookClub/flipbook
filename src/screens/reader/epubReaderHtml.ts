import { Asset } from "expo-asset";
import {
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  readAsStringAsync,
  writeAsStringAsync,
} from "expo-file-system/legacy";

import epubLibAsset from "../../../assets/epubjs/epub.min.epubjs";
import jszipAsset from "../../../assets/epubjs/jszip.min.epubjs";
import { EPUB_RUNTIME } from "./epubRuntime";

// Assembles a self-contained EPUB reader document: JSZip + epub.js + our
// runtime, all inlined, written once to disk and loaded over file://. Nothing
// is fetched at runtime, so the reader works in airplane mode (P4-T9).
//
// The same shape the PDF.js reader used in June, for the same reason: a WebView
// pointed at a remote bundle is not an offline reader.

// Bump when the runtime, CSS, or bundled libs change, so a stale on-disk copy
// gets rewritten rather than silently serving the old reader.
const READER_VERSION = "5";

// Written into the same directory as the cached .epub files. WKWebView grants
// read access by directory, so co-locating means the page can fetch the book
// without widening file access to the whole sandbox.
export const EPUB_READER_DIR = `${documentDirectory ?? ""}books/`;
const HTML_PATH = `${EPUB_READER_DIR}epub-reader-v${READER_VERSION}.html`;

let cachedUri: string | null = null;

async function assetText(assetId: number): Promise<string> {
  const asset = Asset.fromModule(assetId);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  return readAsStringAsync(uri);
}

const CSS = `
  html, body {
    margin: 0; padding: 0; height: 100%; overflow: hidden;
    -webkit-text-size-adjust: 100%;
  }
  /* The reader owns the full viewport; epub.js paginates inside #viewer. */
  #viewer { width: 100vw; height: 100vh; }
  /* epub.js injects its own iframe per section; keep it from showing seams. */
  #viewer iframe { border: 0; }
`;

function buildHtml(jszip: string, epub: string): string {
  return [
    "<!doctype html>",
    '<html><head><meta charset="utf-8" />',
    // user-scalable=no: pinch-zoom fights pagination, and font size is a
    // first-class control instead (P4-T6).
    '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />',
    "<style>" + CSS + "</style>",
    "</head><body>",
    '<div id="viewer"></div>',
    // Order matters: epub.js resolves JSZip off the global at load time.
    "<script>" + jszip + "</script>",
    "<script>" + epub + "</script>",
    "<script>" + EPUB_RUNTIME + "</script>",
    "</body></html>",
  ].join("\n");
}

export async function getEpubReaderHtmlUri(): Promise<string> {
  if (cachedUri) return cachedUri;

  const dir = await getInfoAsync(EPUB_READER_DIR);
  if (!dir.exists) {
    await makeDirectoryAsync(EPUB_READER_DIR, { intermediates: true });
  }

  // __DEV__ always rewrites: a stale copy served an old runtime through a
  // whole debug round and made new instrumentation look like it never ran.
  const existing = __DEV__ ? { exists: false } : await getInfoAsync(HTML_PATH);
  if (existing.exists && !("isDirectory" in existing && existing.isDirectory)) {
    cachedUri = HTML_PATH;
    return HTML_PATH;
  }

  const [jszip, epub] = await Promise.all([
    assetText(jszipAsset),
    assetText(epubLibAsset),
  ]);
  await writeAsStringAsync(HTML_PATH, buildHtml(jszip, epub));
  cachedUri = HTML_PATH;
  return HTML_PATH;
}
