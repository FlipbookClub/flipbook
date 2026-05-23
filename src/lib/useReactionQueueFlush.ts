import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";

import { useConnectivity } from "./connectivity";
import {
  bumpAttempt,
  dropQueued,
  isTerminalRejection,
  listQueued,
  type QueuedReaction,
} from "./reactionQueue";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const MAX_ATTEMPTS = 5;

// Mount once at the root. Watches connectivity; when we come online, drains
// the offline reaction queue serially. Terminal server rejections (rate
// limit, validation) drop the item; transient failures bump attempts and
// stay for the next reconnect.
export function useReactionQueueFlush(): void {
  const { isOnline } = useConnectivity();
  const createReaction = useMutation(api.reactions.create);
  const flushing = useRef(false);

  useEffect(() => {
    if (!isOnline || flushing.current) return;
    const items = listQueued();
    if (items.length === 0) return;

    flushing.current = true;
    void (async () => {
      try {
        for (const item of items) {
          if (item.attempts >= MAX_ATTEMPTS) {
            dropQueued(item.localId);
            continue;
          }
          try {
            await callCreate(createReaction, item);
            dropQueued(item.localId);
          } catch (err) {
            const code = (err as { data?: { code?: string } })?.data?.code;
            if (isTerminalRejection(code)) {
              dropQueued(item.localId);
            } else {
              bumpAttempt(item.localId);
              // Stop the run on transient failure so we don't burn through
              // attempts on what's probably a flaky link — next online tick
              // will retry from the top.
              break;
            }
          }
        }
      } finally {
        flushing.current = false;
      }
    })();
  }, [isOnline, createReaction]);
}

async function callCreate(
  mutation: ReturnType<typeof useMutation<typeof api.reactions.create>>,
  item: QueuedReaction,
): Promise<void> {
  await mutation({
    clubId: item.clubId as Id<"clubs">,
    bookId: item.bookId as Id<"books"> | undefined,
    chapterId: item.chapterId as Id<"chapters"> | undefined,
    page: item.page,
    paragraphIndex: undefined,
    type: item.type,
    emoji: item.emoji,
    text: item.text,
    parentReactionId: item.parentReactionId as Id<"reactions"> | undefined,
  });
}
