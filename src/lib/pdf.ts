import * as DocumentPicker from "expo-document-picker";
import {
  createUploadTask,
  deleteAsync,
  documentDirectory,
  downloadAsync,
  FileSystemUploadType,
  getInfoAsync,
  makeDirectoryAsync,
  type FileSystemUploadResult,
} from "expo-file-system/legacy";

import { storage } from "./storage";

// FR-010: 50MB cap, mirrored server-side in convex/books.ts.
export const MAX_PDF_BYTES = 50 * 1024 * 1024;

// FR-012 LRU eviction ceiling. 500MB across all cached PDFs.
const PDF_CACHE_MAX_BYTES = 500 * 1024 * 1024;
const PDF_CACHE_DIR = `${documentDirectory ?? ""}books/`;
const PDF_CACHE_INDEX_KEY = "pdfCache:v1:index";

interface CacheEntry {
  storageId: string;
  bytes: number;
  lastAccessAt: number;
}

export interface PickedPdf {
  uri: string;
  name: string;
  mimeType: string | null;
  size: number;
}

export type PickPdfResult =
  | { ok: true; file: PickedPdf }
  | { ok: false; reason: "cancelled" | "too_large" | "not_pdf" | "no_size" };

export async function pickPdf(): Promise<PickPdfResult> {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/pdf",
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || result.assets.length === 0) {
    return { ok: false, reason: "cancelled" };
  }
  const asset = result.assets[0];
  const mimeType = asset.mimeType ?? null;
  // Some Android devices return mimeType as null for PDFs picked from certain
  // providers — fall back to the .pdf extension check rather than rejecting.
  const looksLikePdf =
    mimeType === "application/pdf" ||
    asset.name.toLowerCase().endsWith(".pdf");
  if (!looksLikePdf) return { ok: false, reason: "not_pdf" };
  if (asset.size == null) return { ok: false, reason: "no_size" };
  if (asset.size > MAX_PDF_BYTES) return { ok: false, reason: "too_large" };
  return {
    ok: true,
    file: {
      uri: asset.uri,
      name: asset.name,
      mimeType,
      size: asset.size,
    },
  };
}

export interface UploadResult {
  storageId: string;
}

// Uploads the local PDF to the Convex-issued upload URL and returns the
// storage ID. Uses expo-file-system's createUploadTask so the file streams
// from disk (rather than loading the whole PDF into memory) and so we can
// surface progress for the 50MB-on-cellular case.
export async function uploadPdf(
  uploadUrl: string,
  file: PickedPdf,
  onProgress?: (fraction: number) => void,
): Promise<UploadResult> {
  const task = createUploadTask(
    uploadUrl,
    file.uri,
    {
      httpMethod: "POST",
      uploadType: FileSystemUploadType.BINARY_CONTENT,
      headers: { "Content-Type": file.mimeType ?? "application/pdf" },
    },
    onProgress
      ? (data) => {
          if (data.totalBytesExpectedToSend > 0) {
            onProgress(data.totalBytesSent / data.totalBytesExpectedToSend);
          }
        }
      : undefined,
  );
  const result: FileSystemUploadResult | undefined | null = await task.uploadAsync();
  if (!result) throw new Error("Upload was cancelled");
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Upload failed with status ${result.status}`);
  }
  const body = JSON.parse(result.body) as { storageId?: string };
  if (!body.storageId) throw new Error("Upload succeeded but no storageId returned");
  return { storageId: body.storageId };
}

// ---------------------------------------------------------------------------
// FR-012: offline PDF cache
// ---------------------------------------------------------------------------

function readIndex(): CacheEntry[] {
  const raw = storage.getString(PDF_CACHE_INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CacheEntry[];
  } catch {
    return [];
  }
}

function writeIndex(entries: CacheEntry[]): void {
  storage.set(PDF_CACHE_INDEX_KEY, JSON.stringify(entries));
}

function localPathFor(storageId: string): string {
  // The storage ID is opaque but URL-safe enough to use as a filename.
  return `${PDF_CACHE_DIR}${encodeURIComponent(storageId)}.pdf`;
}

async function ensureCacheDir(): Promise<void> {
  const info = await getInfoAsync(PDF_CACHE_DIR);
  if (!info.exists) {
    await makeDirectoryAsync(PDF_CACHE_DIR, { intermediates: true });
  }
}

async function evictUntilUnder(maxBytes: number): Promise<CacheEntry[]> {
  const entries = readIndex().sort((a, b) => a.lastAccessAt - b.lastAccessAt);
  let total = entries.reduce((sum, e) => sum + e.bytes, 0);
  while (total > maxBytes && entries.length > 0) {
    const oldest = entries.shift()!;
    try {
      await deleteAsync(localPathFor(oldest.storageId), { idempotent: true });
    } catch {
      // best-effort
    }
    total -= oldest.bytes;
  }
  writeIndex(entries);
  return entries;
}

function touchEntry(entries: CacheEntry[], storageId: string, bytes: number): CacheEntry[] {
  const filtered = entries.filter((e) => e.storageId !== storageId);
  filtered.push({ storageId, bytes, lastAccessAt: Date.now() });
  return filtered;
}

// Returns a local file URI for the given storage ID, downloading from the
// signed URL on cache miss. After this resolves, react-native-pdf can render
// from disk and subsequent opens are instant + offline-capable.
export async function ensureCachedPdf(storageId: string, signedUrl: string): Promise<string> {
  await ensureCacheDir();
  const localPath = localPathFor(storageId);
  const info = await getInfoAsync(localPath);

  if (info.exists && !info.isDirectory) {
    const bytes = typeof info.size === "number" ? info.size : 0;
    writeIndex(touchEntry(readIndex(), storageId, bytes));
    return localPath;
  }

  const download = await downloadAsync(signedUrl, localPath);
  if (download.status < 200 || download.status >= 300) {
    throw new Error(`PDF download failed with status ${download.status}`);
  }
  const downloaded = await getInfoAsync(localPath);
  const bytes =
    downloaded.exists && !downloaded.isDirectory && typeof downloaded.size === "number"
      ? downloaded.size
      : 0;

  const next = touchEntry(readIndex(), storageId, bytes);
  writeIndex(next);
  await evictUntilUnder(PDF_CACHE_MAX_BYTES);

  return localPath;
}

// Synchronous probe so the reader can render from cache instantly without
// waiting for a fresh signed URL when offline.
export function getCachedPdfPath(storageId: string): string | null {
  const entries = readIndex();
  const hit = entries.find((e) => e.storageId === storageId);
  return hit ? localPathFor(storageId) : null;
}
