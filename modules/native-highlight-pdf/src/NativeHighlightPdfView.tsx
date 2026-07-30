import { requireNativeView } from "expo";
import * as React from "react";

import type { NativeHighlightPdfViewProps, NativeHighlightPdfViewRef } from "./NativeHighlightPdf.types";

// requireNativeView's declared type doesn't include `ref` — cast once here so
// the wrapper below can forward a typed ref to the native view.
const NativeView = requireNativeView("NativeHighlightPdf") as unknown as React.ComponentType<
  NativeHighlightPdfViewProps & { ref?: React.Ref<NativeHighlightPdfViewRef> }
>;

export const NativeHighlightPdfView = React.forwardRef<NativeHighlightPdfViewRef, NativeHighlightPdfViewProps>(
  function NativeHighlightPdfView(props, ref) {
    return <NativeView {...props} ref={ref} />;
  },
);
