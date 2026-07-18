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
  | { kind: "ok" }
  | { kind: "error"; code: WaitlistErrorCode };

// Convenience fallback on /get-flipbook for anyone browsing on a laptop —
// emails them the same install links shown on the page. Not a waitlist: the
// welcome email (convex/email.ts) sends the real links immediately.
export function DownloadLinksForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const reduced = useReducedMotion();

  const isLoading = status.kind === "loading";
  const isSuccess = status.kind === "ok";

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
      source: "get-flipbook-page",
    });
    if (result.ok) {
      setStatus({ kind: "ok" });
    } else {
      setStatus({ kind: "error", code: result.code });
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-pull p-6 md:p-8">
      <p className="font-display text-xl text-text">On your laptop?</p>
      <p className="mt-2 text-[15px] leading-[1.6] text-text-muted">
        Enter your email and we&apos;ll send the install links to your phone.
      </p>

      <form onSubmit={handleSubmit} noValidate aria-live="polite" className="mt-5">
        <AnimatePresence mode="wait" initial={false}>
          {isSuccess ? (
            <motion.p
              key="success"
              initial={{ opacity: 0, y: reduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-[15px] text-text"
            >
              Sent. Check your inbox in the next minute.
            </motion.p>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <label className="flex-1">
                <span className="sr-only">Email address</span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status.kind === "error") setStatus({ kind: "idle" });
                  }}
                  disabled={isLoading}
                  className="h-12 w-full rounded-full border border-line bg-bg-elevated/60 px-5 text-[15px] text-text shadow-sm placeholder:text-text-subtle focus:border-accent focus:outline-none focus:ring-0"
                />
              </label>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-[14px] font-semibold tracking-wide text-white shadow-lg shadow-accent/25 transition-all duration-300 hover:bg-accent-strong hover:shadow-accent/40 active:scale-[0.98] disabled:opacity-70 disabled:shadow-none"
              >
                {isLoading ? "Sending…" : "Send me the links"}
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
              className="mt-3 text-[13px] text-accent"
            >
              {copyForError(status.code)}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
