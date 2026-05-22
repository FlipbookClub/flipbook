// SVG imports — handled at bundle time by react-native-svg-transformer.
declare module "*.svg" {
  import type React from "react";
  import type { SvgProps } from "react-native-svg";
  const component: React.FC<SvgProps>;
  export default component;
}
