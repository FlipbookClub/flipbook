import * as React from "react";
import { Text, View } from "react-native";

import type { NativeHighlightPdfViewProps, NativeHighlightPdfViewRef } from "./NativeHighlightPdf.types";

// Flipbook is mobile-only; this stub exists purely so `expo start --web`
// doesn't hard-crash if it ever renders a screen that imports this module.
export const NativeHighlightPdfView = React.forwardRef<NativeHighlightPdfViewRef, NativeHighlightPdfViewProps>(
  function NativeHighlightPdfView(props, _ref) {
    return (
      <View style={props.style}>
        <Text>PDF highlighting isn't available on web.</Text>
      </View>
    );
  },
);
