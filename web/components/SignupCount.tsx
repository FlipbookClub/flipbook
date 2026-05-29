"use client";

import { useEffect, useState } from "react";

// Display offset for the social-proof count. The waitlist table starts empty,
// but a "0 readers" line reads dead — so we seed the public number at 49. The
// very first real signup then shows as 50, the second as 51, and so on. The
// real row count lives in Convex; this is purely a presentation floor.
const DISPLAY_BASELINE = 49;

export function SignupCount() {
  // Initialise at the baseline so SSR + first paint already show a live-looking
  // number (no "loading" flash); the real total folds in once the fetch lands.
  const [total, setTotal] = useState(DISPLAY_BASELINE);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
    if (!base) return;
    let alive = true;
    fetch(`${base.replace(/\/$/, "")}/waitlist/count`)
      .then((r) => r.json())
      .then((d: unknown) => {
        const c = (d as { count?: unknown })?.count;
        if (alive && typeof c === "number") setTotal(DISPLAY_BASELINE + c);
      })
      .catch(() => {
        // Network hiccup — keep the baseline. Social proof is decorative.
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <span>
      <span className="font-semibold text-text">{total.toLocaleString("en-US")}</span>{" "}
      readers already on the list.
    </span>
  );
}
