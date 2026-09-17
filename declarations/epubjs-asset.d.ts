// Raw-text assets bundled through Metro's assetExts (see metro.config.js).
// The import resolves to an opaque numeric asset id, which expo-asset turns
// back into a readable local file. Mirrors how `.svg` is declared next door.
declare module "*.epubjs" {
  const asset: number;
  export default asset;
}
