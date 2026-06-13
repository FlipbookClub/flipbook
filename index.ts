// MUST be the first import: polyfills crypto.getRandomValues before any module
// (Clerk, Convex) tries to create a client. Without it, release builds tree-shake
// the transitive polyfill and Clerk's client init hangs forever (isLoaded stays
// false → white screen). Keep this at the very top.
import "react-native-get-random-values";

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
