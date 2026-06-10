"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import {
  copyForError,
  submitWaitlist,
  validateEmail,
  type WaitlistErrorCode,
} from "@/lib/waitlist";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok-new" }
  | { kind: "ok-existing" }
  | { kind: "error"; code: WaitlistErrorCode };

// Creator-list signup. Same backend table as the reader form (audience flag
// flips reader→creator, and audience widens — see convex/waitlist.ts).
export function CreatorForm() {
  const [email, setEmail] = useState("");
  const [creatorLink, setCreatorLink] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const reduced = useReducedMotion();

  const isLoading = status.kind === "loading";
  const isSuccess = status.kind === "ok-new" || status.kind === "ok-existing";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading || isSuccess) return;

    const emailError = validateEmail(email);
    if (emailError) {
      setStatus({ kind: "error", code: emailError });
      return;
    }
    setStatus({ kind: "loading" });

    const result = await submitWaitlist({
      email: email.trim(),
      audience: "creator",
      creatorLink: creatorLink.trim() || undefined,
      source: "creator-card",
    });
    if (result.ok) {
      setStatus({ kind: result.isNew ? "ok-new" : "ok-existing" });
    } else {
      setStatus({ kind: "error", code: result.code });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-live="polite" className="mt-8 space-y-3">
      <AnimatePresence mode="wait" initial={false}>
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: reduced ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-line bg-pull p-5"
          >
            <p className="font-display text-xl text-text">
              {status.kind === "ok-new"
                ? "You're on the creator list."
                : "You're already on the creator list."}
            </p>
            <p className="mt-1 text-sm text-text-muted">We&apos;ll be in touch.</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status.kind === "error") setStatus({ kind: "idle" });
              }}
              disabled={isLoading}
              className="h-11 w-full rounded-full border border-line bg-bg-elevated/30 px-5 text-[14px] text-text placeholder:text-text-subtle focus:border-accent focus:outline-none"
            />
            <input
              type="text"
              placeholder="link to your work (substack, IG, blog…)"
              value={creatorLink}
              onChange={(e) => setCreatorLink(e.target.value)}
              disabled={isLoading}
              className="h-11 w-full rounded-full border border-line bg-bg-elevated/30 px-5 text-[14px] text-text placeholder:text-text-subtle focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-11 items-center justify-center rounded-full border border-accent px-6 text-[13px] font-semibold tracking-wide text-accent transition-colors duration-300 hover:bg-accent hover:text-white disabled:opacity-70"
            >
              {isLoading ? "Adding you…" : "Join the creator list"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {status.kind === "error" && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="text-[13px] text-accent"
          >
            {copyForError(status.code)}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
