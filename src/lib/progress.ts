import { useEffect, useRef } from "react";

import { storage } from "./storage";

const PROGRESS_PREFIX = "progress:v1:";
// FR-013: server writes are throttled to once per 2s.
export const PROGRESS_SYNC_INTERVAL_MS = 2000;

export interface CachedProgress {
  bookId: string;
  page: number;
  totalPages: number;
  updatedAt: number;
}

function key(bookId: string): string {
  return `${PROGRESS_PREFIX}${bookId}`;
}

export function readCachedProgress(bookId: string): CachedProgress | null {
  const raw = storage.getString(key(bookId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedProgress;
  } catch {
    return null;
  }
}

export function writeCachedProgress(p: CachedProgress): void {
  storage.set(key(p.bookId), JSON.stringify(p));
}

// Trailing-edge throttle: ensures the LAST call within the window still fires
// after the cooldown. Plain throttle drops trailing calls — which means the
// final page the user landed on never makes it to the server.
export function useThrottledCallback<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  intervalMs: number,
): (...args: TArgs) => void {
  const lastCallAt = useRef(0);
  const pendingArgs = useRef<TArgs | null>(null);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    return () => {
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
      if (pendingArgs.current) fnRef.current(...pendingArgs.current);
    };
  }, []);

  return (...args: TArgs) => {
    const now = Date.now();
    const elapsed = now - lastCallAt.current;
    if (elapsed >= intervalMs) {
      lastCallAt.current = now;
      pendingArgs.current = null;
      if (pendingTimer.current) {
        clearTimeout(pendingTimer.current);
        pendingTimer.current = null;
      }
      fnRef.current(...args);
    } else {
      pendingArgs.current = args;
      if (!pendingTimer.current) {
        pendingTimer.current = setTimeout(() => {
          pendingTimer.current = null;
          if (pendingArgs.current) {
            lastCallAt.current = Date.now();
            const queued = pendingArgs.current;
            pendingArgs.current = null;
            fnRef.current(...queued);
          }
        }, intervalMs - elapsed);
      }
    }
  };
}
