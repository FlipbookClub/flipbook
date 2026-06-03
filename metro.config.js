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

module.exports = withNativeWind(config, { input: "./global.css" });
