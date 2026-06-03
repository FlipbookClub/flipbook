import { storage } from "./storage";

// FR-016 / FR-013 edge case: drops while offline are queued locally and
// synced on reconnect. Lives in MMKV so the queue survives app restarts.

const QUEUE_KEY = "reactionQueue:v1";

export interface QueuedReaction {
  // Local UUID — used to dedupe if the user re-submits the same intent.
  localId: string;
  clubId: string;
  bookId?: string;
  chapterId?: string;
  page: number;
  type: "emoji" | "comment";
  emoji?: string;
  text?: string;
  parentReactionId?: string;
  highlightQuote?: string;
  highlightRects?: { x: number; y: number; w: number; h: number }[];
  queuedAt: number;
  // Attempt counter — server-rejection (rate limit, validation) drops the
  // item rather than retrying forever.
  attempts: number;
}

function read(): QueuedReaction[] {
  const raw = storage.getString(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueuedReaction[];
  } catch {
    return [];
  }
}

function write(items: QueuedReaction[]): void {
  storage.set(QUEUE_KEY, JSON.stringify(items));
}

export function enqueueReaction(item: Omit<QueuedReaction, "localId" | "queuedAt" | "attempts">): QueuedReaction {
  const queued: QueuedReaction = {
    ...item,
    localId: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    queuedAt: Date.now(),
    attempts: 0,
  };
  write([...read(), queued]);
  return queued;
}

export function listQueued(): QueuedReaction[] {
  return read();
}

export function dropQueued(localId: string): void {
  write(read().filter((r) => r.localId !== localId));
}

export function bumpAttempt(localId: string): void {
  const items = read();
  const idx = items.findIndex((r) => r.localId === localId);
  if (idx === -1) return;
  items[idx] = { ...items[idx], attempts: items[idx].attempts + 1 };
  write(items);
}

export function clearQueue(): void {
  write([]);
}

// Server-rejection codes that mean "don't retry" — they'd fail forever.
const TERMINAL_REJECTIONS = new Set([
  "rate_limited", // user can re-react later if they care
  "invalid_emoji",
  "invalid_page",
  "empty_comment",
  "comment_too_long",
  "emoji_should_not_have_text",
  "comment_should_not_have_emoji",
  "exactly_one_scope_required",
  "parent_not_found",
  "replies_are_flat",
  "reply_page_mismatch",
  "not_a_member",
]);

export function isTerminalRejection(code: string | undefined): boolean {
  return !!code && TERMINAL_REJECTIONS.has(code);
}
