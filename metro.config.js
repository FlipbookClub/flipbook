const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// SVG imports via react-native-svg-transformer — lets us import `.svg` files as
// React components (e.g. `import Logo from "@/assets/.../full-light-colored.svg"`).
config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer/expo",
);
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== "svg");
config.resolver.sourceExts.push("svg");

// Bundle the PDF.js library as a raw text asset (custom extension so Metro
// treats it as an asset, not a source module). Loaded + inlined into the
// WebView reader HTML at runtime — see src/screens/reader/readerHtml.ts.
config.resolver.assetExts.push("pdfjs");

module.exports = withNativeWind(config, { input: "./global.css" });
