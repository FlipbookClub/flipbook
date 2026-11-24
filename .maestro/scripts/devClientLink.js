// Builds the link that tells Flipbook Dev to load its code from the dev
// server on the Mac. DEV_SERVER_URL comes from the flow's env.
// "exp+flipbook" is the dev client's own scheme: "exp+" plus the app slug
// (node_modules/expo-dev-client/plugin/src/getDefaultScheme.ts).
output.devClientLink =
  "exp+flipbook://expo-development-client/?url=" + encodeURIComponent(DEV_SERVER_URL);
