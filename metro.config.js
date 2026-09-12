const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// SVG imports via react-native-svg-transformer — lets us import `.svg` files as
// React components (e.g. `import Logo from "@/assets/.../full-light-colored.svg"`).
config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer/expo",
);
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== "svg");
config.resolver.sourceExts.push("svg");

// P4-T5. epub.js + JSZip ship as raw text assets (custom extension so Metro
// treats them as assets, not source modules). They are inlined into the EPUB
// reader HTML at runtime so the reader works with no network — see
// src/screens/reader/epubReaderHtml.ts.
config.resolver.assetExts.push("epubjs");

// Resolve NativeWind's input + tailwind config from THIS file's directory, not
// the process cwd — otherwise launching Metro from a subfolder (e.g. web/) makes
// NativeWind look for `web/tailwind.config` and crash.
module.exports = withNativeWind(config, {
  input: path.resolve(__dirname, "global.css"),
  configPath: path.resolve(__dirname, "tailwind.config"),
});
