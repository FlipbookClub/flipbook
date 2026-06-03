// Raw-text assets bundled via Metro (custom extension registered in
// metro.config.js). require() returns the asset module id consumed by
// expo-asset's Asset.fromModule.
declare module "*.pdfjs" {
  const assetId: number;
  export default assetId;
}
