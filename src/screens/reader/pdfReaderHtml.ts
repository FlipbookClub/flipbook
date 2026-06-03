import { Asset } from "expo-asset";
import {
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  readAsStringAsync,
  writeAsStringAsync,
} from "expo-file-system/legacy";

import pdfLibAsset from "../../../assets/pdfjs/pdf.lib.pdfjs";
import pdfWorkerAsset from "../../../assets/pdfjs/pdf.worker.pdfjs";
import { READER_RUNTIME } from "./readerRuntime";

// Bump when the HTML/runtime/lib change so a stale on-disk copy is rewritten.
const READER_VERSION = "1";

let cachedUri: string | null = null;

async function assetText(assetId: number): Promise<string> {
  const asset = Asset.fromModule(assetId);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  return readAsStringAsync(uri);
}

// Minimal PDF.js text-layer CSS — the text spans sit transparently over the
// canvas so native selection works and aligns with the rendered page.
const CSS = `
  html, body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
  body { background: #ffffff; }
  #viewer { width: 100%; }
  .page { position: relative; margin: 0 auto 10px; background: #fff; box-shadow: 0 1px 6px rgba(0,0,0,0.12); }
  .page canvas { display: block; }
  .textLayer {
    position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden;
    line-height: 1; opacity: 1; text-align: initial; -webkit-text-size-adjust: none;
  }
  .textLayer span, .textLayer br {
    color: transparent; position: absolute; white-space: pre; cursor: text;
    transform-origin: 0 0;
  }
  .textLayer ::selection { background: rgba(93,58,90,0.35); }
  .textLayer ::-moz-selection { background: rgba(93,58,90,0.35); }
  .hl {
    position: absolute; background: rgba(228,179,99,0.38); border-radius: 2px;
    pointer-events: auto; cursor: pointer;
  }
`;

function buildHtml(lib: string, worker: string): string {
  return [
    "<!doctype html>",
    '<html><head><meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />',
    "<style>" + CSS + "</style>",
    "</head><body>",
    '<div id="viewer"></div>',
    // Worker source parked in a non-executing script; the runtime turns its
    // textContent into a Blob worker. (Verified to contain no </script>.)
    '<script id="pdf-worker" type="javascript/worker">' + worker + "</script>",
    "<script>" + lib + "</script>",
    "<script>" + READER_RUNTIME + "</script>",
    "</body></html>",
  ].join("\n");
}

// Assembles the self-contained reader HTML (PDF.js lib + worker + runtime),
// writes it to documentDirectory/reader/index.html, and returns its file URI.
// Loaded from a file:// origin so future offline file fetches are same-origin.
export async function getReaderHtmlUri(): Promise<string> {
  if (cachedUri) return cachedUri;
  const dir = (documentDirectory ?? "") + "reader/";
  const path = dir + "index-v" + READER_VERSION + ".html";

  const existing = await getInfoAsync(path);
  if (existing.exists && !existing.isDirectory) {
    cachedUri = path;
    return path;
  }

  const [lib, worker] = await Promise.all([assetText(pdfLibAsset), assetText(pdfWorkerAsset)]);
  const dirInfo = await getInfoAsync(dir);
  if (!dirInfo.exists) await makeDirectoryAsync(dir, { intermediates: true });
  await writeAsStringAsync(path, buildHtml(lib, worker));
  cachedUri = path;
  return path;
}
