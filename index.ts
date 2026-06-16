// MUST be the first import: installs crypto.getRandomValues (backed by
// expo-crypto, which is autolinked into every build) before any module (Clerk,
// Convex) constructs a client. Without a working crypto.getRandomValues, Clerk's
// init hangs forever in release builds — isLoaded stays false → blank/white
// screen. Keep this at the very top. See src/lib/crypto-polyfill.ts.
import "./src/lib/crypto-polyfill";

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
