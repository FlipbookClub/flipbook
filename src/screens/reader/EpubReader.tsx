import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { EPUB_READER_DIR, getEpubReaderHtmlUri } from "./epubReaderHtml";

// P4-T5. epub.js inside react-native-webview, one implementation for both
// platforms, deliberately no native module work.
//
// Guarded require, per 169beb3: importing react-native-webview at module load
// on a binary that lacks the native module throws during startup and hangs on
// the splash screen. A reader that says "needs a rebuild" beats a dead app.
let WebViewComponent: React.ComponentType<Record<string, unknown>> | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  WebViewComponent = require("react-native-webview").WebView;
} catch {
  WebViewComponent = null;
}

export interface TocEntry {
  label: string;
  href: string;
  depth: number;
}

export interface EpubReaderHandle {
  next: () => void;
  prev: () => void;
  gotoHref: (href: string) => void;
  setFontSize: (percent: number) => void;
  setTheme: (bg: string, fg: string) => void;
}

interface Props {
  /** file:// path to the cached .epub. */
  fileUri: string;
  /** Stored resume position. Undefined opens at the beginning. */
  startCfi?: string;
  fontSize: number;
  bg: string;
  fg: string;
  onRelocated?: (cfi: string, percent: number) => void;
  onReady?: (toc: TocEntry[]) => void;
  onTap?: () => void;
  onError?: (message: string) => void;
}

type Incoming =
  | { type: "runtimeReady" }
  | { type: "ready"; toc: TocEntry[]; title: string | null; spineLength: number }
  | { type: "displayed" }
  | { type: "cfiRejected" }
  | { type: "locationsReady"; total: number }
  | { type: "relocated"; cfi: string; percent: number; atStart: boolean; atEnd: boolean }
  | { type: "tap" }
  | { type: "debug"; tag: string; detail?: string }
  | { type: "error"; where: string; message: string };

export const EpubReader = forwardRef<EpubReaderHandle, Props>(function EpubReader(
  { fileUri, startCfi, fontSize, bg, fg, onRelocated, onReady, onTap, onError },
  ref,
) {
  const webRef = useRef<{ injectJavaScript: (js: string) => void } | null>(null);
  const [htmlUri, setHtmlUri] = useState<string | null>(null);
  const [displayed, setDisplayed] = useState(false);
  // The runtime must exist before `open` is sent, and the WebView's onLoadEnd
  // can beat the inline script. Gate on the runtime's own announcement.
  const runtimeReadyRef = useRef(false);
  const openedRef = useRef(false);

  const send = useCallback((msg: Record<string, unknown>) => {
    const json = JSON.stringify(msg);
    webRef.current?.injectJavaScript(
      `window.__epubBridge && window.__epubBridge.handle(${json}); true;`,
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    getEpubReaderHtmlUri()
      .then((uri) => {
        if (!cancelled) setHtmlUri(uri);
      })
      .catch((e) => onError?.(`reader html: ${String(e)}`));
    return () => {
      cancelled = true;
    };
  }, [onError]);

  const sendRef = useRef(send);
  sendRef.current = send;

  // NB: declared after sendRef on purpose. The gesture closure captures
  // its variables when this memo runs, so building it above the ref
  // captured `undefined` and every swipe threw at onEnd.
  // Page turns are driven from here, not from inside the WebView. The
  // instrumented device run showed gesture listeners attaching successfully to
  // each section's iframe document and then never receiving a single
  // touchstart: the touches are consumed before the web content sees them, and
  // Gesture.Native() did not release them. Rather than keep guessing at
  // WKWebView touch delivery, RNGH recognises the swipe (which it plainly can,
  // since it is what was swallowing them) and drives epub.js over the bridge
  // that the table of contents already proves works.
  //
  // activeOffsetX means the pan only claims the gesture after real horizontal
  // movement, so taps and long-presses still reach the page; failOffsetY lets a
  // vertical drag out, for content that scrolls inside its own section.
  const swipe = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-20, 20])
        .failOffsetY([-24, 24])
        .runOnJS(true)
        // Logged on the RN side deliberately: this is independent of the
        // reader HTML, so it stays truthful even if a stale runtime is cached.
        .onBegin(() => {
          if (__DEV__) console.log("[epub][rn] pan:begin");
        })
        .onStart(() => {
          if (__DEV__) console.log("[epub][rn] pan:start (recognised)");
        })
        .onEnd((e) => {
          if (__DEV__) {
            console.log(`[epub][rn] pan:end dx=${Math.round(e.translationX)}`);
          }
          if (Math.abs(e.translationX) < 40) return;
          if (e.translationX < 0) sendRef.current({ type: "next" });
          else sendRef.current({ type: "prev" });
        }),
    [],
  );


  useImperativeHandle(ref, () => ({
    next: () => send({ type: "next" }),
    prev: () => send({ type: "prev" }),
    gotoHref: (href) => send({ type: "gotoHref", href }),
    setFontSize: (value) => send({ type: "setFontSize", value }),
    setTheme: (b, f) => send({ type: "setTheme", bg: b, fg: f }),
  }));

  // Theme and font size are re-sent on change; the runtime re-anchors on the
  // current CFI so a font change does not throw away the reading position.
  useEffect(() => {
    if (displayed) send({ type: "setTheme", bg, fg });
  }, [displayed, bg, fg, send]);
  useEffect(() => {
    if (displayed) send({ type: "setFontSize", value: fontSize });
  }, [displayed, fontSize, send]);

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      let msg: Incoming;
      try {
        msg = JSON.parse(event.nativeEvent.data) as Incoming;
      } catch {
        return;
      }
      switch (msg.type) {
        case "runtimeReady":
          runtimeReadyRef.current = true;
          if (!openedRef.current) {
            openedRef.current = true;
            send({
              type: "open",
              url: fileUri,
              startCfi: startCfi ?? null,
              fontSize,
              bg,
              fg,
            });
          }
          break;
        case "ready":
          onReady?.(msg.toc ?? []);
          break;
        case "displayed":
          setDisplayed(true);
          break;
        case "relocated":
          onRelocated?.(msg.cfi, msg.percent);
          break;
        case "tap":
          onTap?.();
          break;
        case "debug":
          // Surfaces in Metro. The swipe path is hard to reason about from a
          // screenshot: this says whether the gesture hook registered, whether
          // listeners landed on the section iframe, and what each touch
          // measured. Dev-only so it never ships noise to users.
          if (__DEV__) {
            console.log(`[epub] ${msg.tag}${msg.detail ? ` ${msg.detail}` : ""}`);
          }
          break;
        case "error":
          onError?.(`${msg.where}: ${msg.message}`);
          break;
        // cfiRejected and locationsReady are informational; the runtime has
        // already recovered by the time they arrive.
      }
    },
    [fileUri, startCfi, fontSize, bg, fg, send, onReady, onRelocated, onTap, onError],
  );

  if (!WebViewComponent) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ textAlign: "center", color: bg === "#ffffff" ? "#333" : "#ddd" }}>
          This build can't open EPUBs yet. Reinstall the latest app version.
        </Text>
      </View>
    );
  }

  const WebView = WebViewComponent;

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {htmlUri ? (
        // GestureHandlerRootView wraps the whole app (App.tsx), so RNGH's root
        // recognizer sits above this web view and arbitrates its touches away
        // before the page ever sees them. Gesture.Native() makes it stand down.
        // This is the same fault that broke PDFKit's long-press selection in
        // Phase 2; see feedback on RNGH root arbitration.
        <GestureDetector gesture={swipe}>
        <WebView
          ref={webRef}
          source={{ uri: htmlUri }}
          originWhitelist={["*"]}
          onMessage={handleMessage}
          // The book is a separate file:// URL from the reader document, so the
          // page needs file access to fetch it. allowingReadAccessToURL scopes
          // that to the books directory rather than the whole sandbox.
          allowFileAccess
          allowFileAccessFromFileURLs
          allowingReadAccessToURL={EPUB_READER_DIR}
          // Pagination is horizontal; the outer scroll view would otherwise
          // swallow the swipes epub.js needs.
          scrollEnabled={false}
          bounces={false}
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          style={{ flex: 1, backgroundColor: bg }}
          onError={() => onError?.("webview failed to load the reader")}
        />
        </GestureDetector>
      ) : null}

      {!displayed ? (
        <View
          style={{
            ...StyleSheetAbsoluteFill,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: bg,
          }}
        >
          <ActivityIndicator />
        </View>
      ) : null}
    </View>
  );
});

// Inlined rather than importing StyleSheet for one constant.
const StyleSheetAbsoluteFill = {
  position: "absolute" as const,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};
