import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, Text, View } from "react-native";
import type { WebView as WebViewType, WebViewMessageEvent } from "react-native-webview";
import { documentDirectory } from "expo-file-system/legacy";

import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { getReaderHtmlUri } from "@/screens/reader/pdfReaderHtml";

// react-native-webview is a native module — only present in binaries built
// after it was added. Load it with a guarded require so a stale/simulator
// binary that lacks it never bricks the whole app at startup (the eager static
// import did exactly that). The reader degrades to an "unavailable" notice.
let WebView: typeof import("react-native-webview").WebView | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  WebView = require("react-native-webview").WebView;
} catch {
  WebView = null;
}

export interface HighlightRect {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface ReaderHighlight {
  id: string;
  page: number;
  rects: HighlightRect[];
}
export interface SelectionPayload {
  page: number;
  quote: string;
  rects: HighlightRect[];
}

export interface PdfWebViewHandle {
  jumpToPage: (page: number) => void;
  setHighlights: (items: ReaderHighlight[]) => void;
  clearSelection: () => void;
  setTheme: (bg: string, fg: string) => void;
}

interface Props {
  pdfUrl: string;
  startPage: number;
  bg: string;
  fg: string;
  onPage?: (page: number, total: number) => void;
  onLoaded?: (total: number) => void;
  onSelection?: (s: SelectionPayload) => void;
  onSelectionCleared?: () => void;
  onHighlightTap?: (id: string) => void;
  onError?: (message: string) => void;
}

// The PDF.js-in-WebView reader. Renders the bundled reader HTML from a file://
// URI, injects per-document config before load, and bridges messages both ways.
export const PdfWebView = forwardRef<PdfWebViewHandle, Props>(function PdfWebView(
  { pdfUrl, startPage, bg, fg, onPage, onLoaded, onSelection, onSelectionCleared, onHighlightTap, onError },
  ref,
) {
  const webRef = useRef<WebViewType>(null);
  const [htmlUri, setHtmlUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getReaderHtmlUri()
      .then((uri) => {
        if (!cancelled) setHtmlUri(uri);
      })
      .catch((e) => onError?.("reader html: " + String(e)));
    return () => {
      cancelled = true;
    };
  }, [onError]);

  const send = (msg: Record<string, unknown>) => {
    const json = JSON.stringify(msg);
    webRef.current?.injectJavaScript(
      "window.__readerBridge && window.__readerBridge.handle(" + json + "); true;",
    );
  };

  useImperativeHandle(ref, () => ({
    jumpToPage: (page) => send({ type: "jumpToPage", page }),
    setHighlights: (items) => send({ type: "setHighlights", items }),
    clearSelection: () => send({ type: "clearSelection" }),
    setTheme: (b, f) => send({ type: "setTheme", bg: b, fg: f }),
  }));

  // Config the runtime reads on boot. pdfUrl/startPage/theme are fixed per mount.
  const config = JSON.stringify({ pdfUrl, startPage, bg, fg });

  const onMessage = (e: WebViewMessageEvent) => {
    let msg: { type?: string; [k: string]: unknown };
    try {
      msg = JSON.parse(e.nativeEvent.data);
    } catch {
      return;
    }
    switch (msg.type) {
      case "loaded":
        onLoaded?.(msg.total as number);
        break;
      case "page":
        onPage?.(msg.page as number, msg.total as number);
        break;
      case "selection":
        onSelection?.({
          page: msg.page as number,
          quote: msg.quote as string,
          rects: (msg.rects as HighlightRect[]) ?? [],
        });
        break;
      case "selectionCleared":
        onSelectionCleared?.();
        break;
      case "highlightTap":
        onHighlightTap?.(msg.id as string);
        break;
      case "error":
        onError?.(msg.message as string);
        break;
      default:
        break;
    }
  };

  // Binary doesn't include react-native-webview yet — don't crash, explain it.
  if (!WebView) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bg,
          padding: spacing.s5,
        }}
      >
        <Text style={{ ...typography.bodyMd, color: fg, textAlign: "center" }}>
          The reader needs an app rebuild on this device. Rebuild the dev client to read here.
        </Text>
      </View>
    );
  }

  if (!htmlUri) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: bg }}>
        <ActivityIndicator color={fg} />
      </View>
    );
  }

  return (
    <WebView
      ref={webRef}
      source={{ uri: htmlUri }}
      originWhitelist={["*"]}
      injectedJavaScriptBeforeContentLoaded={"window.__READER__ = " + config + "; true;"}
      onMessage={onMessage}
      // Local file origin + access to the documentDirectory tree (reader html
      // and, later, cached PDF files live there).
      allowFileAccess
      allowFileAccessFromFileURLs
      allowUniversalAccessFromFileURLs
      allowingReadAccessToURL={documentDirectory ?? undefined}
      javaScriptEnabled
      domStorageEnabled
      // Selection is the whole point — don't let the OS hijack the long-press.
      menuItems={[]}
      scrollEnabled
      overScrollMode="never"
      style={{ flex: 1, backgroundColor: bg }}
      onError={(e) => onError?.(String(e.nativeEvent.description))}
    />
  );
});
