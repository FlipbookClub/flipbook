import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Raleway } from "next/font/google";

import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

// Editorial display serif — Contra-style headline weight without the cost
// of self-hosting a paid foundry typeface.
const display = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

// The one sans on the site — body, UI, and brand wordmark — matching the Expo
// app. No Inter; Raleway carries everything that isn't the display serif.
const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://useflipbook.com"),
  title: "Flipbook — Read with the people who are reading right now",
  description:
    "Finish more books with friends. Join reading rooms, share live reactions, and stay accountable together. Free, open beta. No invite code required.",
  openGraph: {
    title: "Flipbook — Read with the people who are reading right now",
    description:
      "Share a book. See your friends' reactions in the margins. Finally finish what you started.",
    type: "website",
    siteName: "Flipbook",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flipbook — Read with the people who are reading right now",
    description:
      "Share a book. See your friends' reactions in the margins. Finally finish what you started.",
  },
  // Icons are picked up from the App Router file conventions in app/:
  // favicon.ico (legacy + bare /favicon.ico), icon.svg (modern, crisp),
  // apple-icon.png (iOS). All are the Flipbook coral mark.
};

export const viewport: Viewport = {
  themeColor: "#3b3a6d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      // ThemeProvider sets data-theme client-side; the SSR default below
      // matches the brand-native Flip mode so the first paint is on-brand
      // even before the script runs.
      data-theme="flip"
      className={`${display.variable} ${raleway.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-bg text-text">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
