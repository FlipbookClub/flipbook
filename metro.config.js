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

// Resolve NativeWind's input + tailwind config from THIS file's directory, not
// the process cwd — otherwise launching Metro from a subfolder (e.g. web/) makes
// NativeWind look for `web/tailwind.config` and crash.
module.exports = withNativeWind(config, {
  input: path.resolve(__dirname, "global.css"),
  configPath: path.resolve(__dirname, "tailwind.config"),
});
