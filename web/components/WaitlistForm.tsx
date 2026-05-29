"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import {
  copyForError,
  submitWaitlist,
  validateEmail,
  type WaitlistErrorCode,
} from "@/lib/waitlist";

interface WaitlistFormProps {
  variant?: "hero" | "final";
  source: string;
  /** Show the optional "what's the last book you finished?" textarea. */
  qualifier?: boolean;
}

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok-new" }
  | { kind: "ok-existing" }
  | { kind: "error"; code: WaitlistErrorCode };

// Shared reader-waitlist form. Used in the hero and in the final CTA.
// Variants differ only in layout — copy + behavior are identical so
// validation/error microcopy stays consistent across the page.
export function WaitlistForm({
  variant = "hero",
  source,
  qualifier = false,
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [qualifierText, setQualifierText] = useState("");
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
      audience: "reader",
      qualifier: qualifier ? qualifierText.trim() || undefined : undefined,
      source,
    });
    if (result.ok) {
      setStatus({ kind: result.isNew ? "ok-new" : "ok-existing" });
    } else {
      setStatus({ kind: "error", code: result.code });
    }
  }

  const buttonLabel = isLoading
    ? "Adding you…"
    : variant === "final"
      ? "Get the beta"
      : "Get the beta";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-live="polite"
      className={
        variant === "hero"
          ? "mt-10 w-full max-w-[460px]"
          : "mt-10 w-full max-w-[520px]"
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: reduced ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-line bg-pull p-6"
          >
            <p className="font-display text-2xl leading-snug text-text">
              {status.kind === "ok-new"
                ? "You're on the list."
                : "You're already on the list."}
            </p>
            <p className="mt-2 text-sm text-text-muted">
              {status.kind === "ok-new"
                ? "Check your inbox in the next minute."
                : "See you on launch day."}
            </p>
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
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex-1">
                <span className="sr-only">Email address</span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder="you@reading.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status.kind === "error") setStatus({ kind: "idle" });
                  }}
                  disabled={isLoading}
                  className="h-12 w-full rounded-full border border-line bg-bg-elevated/40 px-5 text-[15px] text-text placeholder:text-text-subtle focus:border-accent focus:outline-none focus:ring-0"
                />
              </label>
              <button
                type="submit"
                disabled={isLoading}
                className="group inline-flex h-12 items-center justify-center rounded-full bg-accent px-7 text-[14px] font-semibold tracking-wide text-white shadow-lg shadow-accent/25 transition-all duration-300 hover:bg-accent-strong hover:shadow-accent/35 active:scale-[0.98] disabled:opacity-70 disabled:shadow-none"
              >
                {buttonLabel}
              </button>
            </div>
            {qualifier && (
              <label className="block">
                <span className="sr-only">Optional qualifier</span>
                <input
                  type="text"
                  placeholder="(optional) what's the last book you finished?"
                  value={qualifierText}
                  onChange={(e) => setQualifierText(e.target.value)}
                  disabled={isLoading}
                  className="h-11 w-full rounded-full border border-line bg-bg-elevated/30 px-5 text-[14px] text-text placeholder:text-text-subtle focus:border-accent focus:outline-none"
                />
              </label>
            )}
            <p className="pt-1 text-[13px] text-text-muted">
              {variant === "final"
                ? "No spam. About one update a fortnight while we're building. Unsubscribe with one tap."
                : "One email. Pre-launch list, not a newsletter blast."}
            </p>
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
            className="mt-3 text-[13px] text-accent"
          >
            {copyForError(status.code)}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
