import { useCallback, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// THROWAWAY. This screen exists to answer one question before any EPUB reader
// code gets written, and is not meant to merge.
//
// On 2026-06-03 the PDF.js-in-WebView reader was reverted (a6db16c) because it
// triggered "Inconsistency between local and UIKit touch registries": a native
// crash on WKWebView *teardown* that corrupted iOS's touch registry, so the
// next touch ANYWHERE in the app crashed it, once a book had been opened.
//
// That failure is app-wide, not reader-scoped, which is why "the EPUB reader is
// a separate component" buys no protection. If it still reproduces, P4-T5's
// whole approach (epub.js in react-native-webview) is unsafe and we need to
// know now rather than after the reader is built.
//
// Two things have NOT changed since June: RN 0.81.5 with the New Architecture,
// and the app-wide GestureHandlerRootView. `npx expo install` also pins
// react-native-webview to 13.15.0 for SDK 54 — the exact version that crashed.
//
// HOW TO READ THE RESULT
//   1. Tap "Run 20 mount/unmount cycles" and let it finish.
//   2. Then tap "Tap me" repeatedly.
// The June signature is the app dying on a touch AFTER teardown, not during
// the cycles. A counter that keeps incrementing means the crash did not
// reproduce. A hard crash on any tap means it did.

// Guarded require, per 169beb3: importing react-native-webview at module load
// on a binary without the native module throws at startup and hangs on the
// splash screen. Fail loudly here instead.
let WebViewComponent: React.ComponentType<Record<string, unknown>> | null = null;
let requireError: string | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  WebViewComponent = require("react-native-webview").WebView;
} catch (err) {
  requireError = err instanceof Error ? err.message : String(err);
}

const CYCLES = 20;
// Long enough for WKWebView to actually finish loading before we tear it down;
// tearing down a half-initialised web view is a different (easier) case than
// the one that crashed.
const MOUNT_MS = 600;
const UNMOUNT_MS = 250;

const PAGE_HTML = `<!doctype html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
</head><body style="font-family:-apple-system,sans-serif;padding:16px">
<h3>WKWebView instance</h3>
<p>Some selectable text, so the web view builds a real text/gesture layer
rather than staying an empty shell.</p>
<input placeholder="an input, for a first responder" />
</body></html>`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function WebViewTeardownSpike() {
  const [mounted, setMounted] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [running, setRunning] = useState(false);
  const [taps, setTaps] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const startedAt = useRef<number>(0);

  const append = useCallback((line: string) => {
    setLog((prev) => [...prev.slice(-14), line]);
  }, []);

  const runCycles = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setCycle(0);
    setTaps(0);
    setLog([]);
    startedAt.current = Date.now();
    append(`start: ${CYCLES} cycles`);

    for (let i = 1; i <= CYCLES; i++) {
      setMounted(true);
      await sleep(MOUNT_MS);
      // The teardown. This is the operation under test.
      setMounted(false);
      await sleep(UNMOUNT_MS);
      setCycle(i);
      if (i % 5 === 0) append(`survived ${i} teardowns`);
    }

    const secs = ((Date.now() - startedAt.current) / 1000).toFixed(1);
    append(`done in ${secs}s — now tap "Tap me" repeatedly`);
    setRunning(false);
  }, [running, append]);

  if (!WebViewComponent) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 20, gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>
          react-native-webview is not in this binary
        </Text>
        <Text selectable style={{ color: "#666" }}>
          Rebuild the dev client. Original error: {requireError}
        </Text>
      </SafeAreaView>
    );
  }

  const WebView = WebViewComponent;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
        <Text style={{ fontSize: 20, fontWeight: "700" }}>WKWebView teardown spike</Text>
        <Text style={{ color: "#555", lineHeight: 20 }}>
          Run the cycles, then tap the counter. A crash on tap AFTER the cycles
          is the June signature. A counter that keeps going means it did not
          reproduce.
        </Text>

        <Pressable
          onPress={runCycles}
          disabled={running}
          style={{
            backgroundColor: running ? "#999" : "#3b3a6d",
            padding: 16,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
            {running ? `Cycling… ${cycle}/${CYCLES}` : `Run ${CYCLES} mount/unmount cycles`}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setTaps((t) => t + 1)}
          style={{ backgroundColor: "#ff6b6b", padding: 16, borderRadius: 10 }}
        >
          <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
            Tap me — {taps}
          </Text>
        </Pressable>

        <Text style={{ color: "#555" }}>
          Teardowns completed: {cycle} / {CYCLES}
        </Text>

        <View style={{ backgroundColor: "#f4f4f7", borderRadius: 8, padding: 12, gap: 4 }}>
          {log.length === 0 ? (
            <Text style={{ color: "#999" }}>no output yet</Text>
          ) : (
            log.map((l, i) => (
              <Text key={i} style={{ fontFamily: "Courier", fontSize: 12, color: "#333" }}>
                {l}
              </Text>
            ))
          )}
        </View>

        {/* Real height and on-screen: an off-screen or zero-sized web view does
            not build the same native view hierarchy, so tearing one down would
            not exercise the path that crashed. */}
        <View style={{ height: 220, borderRadius: 8, overflow: "hidden", backgroundColor: "#eee" }}>
          {mounted ? (
            <WebView
              source={{ html: PAGE_HTML }}
              style={{ flex: 1 }}
              originWhitelist={["*"]}
            />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#999" }}>web view unmounted</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
