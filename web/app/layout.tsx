import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, Raleway } from "next/font/google";

import { SmoothScroll } from "@/components/SmoothScroll";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Editorial display serif — Contra-style headline weight without the cost
// of self-hosting a paid foundry typeface.
const display = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

// Brand wordmark + section headings — matches the Expo app's Raleway usage.
const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://getflipbook.com"),
  title: "Flipbook — Read with the people who are reading right now",
  description:
    "A social reading app where book clubs read together, with live reactions in the margins. Beta opens soon.",
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
  icons: { icon: "/favicon.ico" },
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
      className={`${inter.variable} ${display.variable} ${raleway.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-bg text-text">
        <ThemeProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
