# Maestro smoke flow

`smoke.yaml` opens **Flipbook Dev**, signs in with the test account and opens the Library (S0-9). It runs on your Mac against a simulator or emulator. It is not in CI yet; when it moves there it will need a build profile that bundles the code, so no dev server is needed (decided by Moks, 23 Nov 2026).

## One-time setup

1. Install Maestro: see maestro.mobile.dev. It needs Java 17 or later.
2. Install **Flipbook Dev** on a simulator or emulator:
   - iOS Simulator: `eas build --profile development --platform ios`, then drag the `.app` onto the simulator.
   - Android emulator: `eas build --profile development-device --platform android`, then install the APK.
3. Create the test account on the **Clerk development instance**. Its email must contain `+clerk_test` (for example `smoke+clerk_test@yourdomain.com`). Clerk's development instances accept the code `424242` for these addresses, so no inbox is needed.
4. Sign in once with that account in Flipbook Dev and finish onboarding, so it has a user in the **development** Convex deployment. Without that, the flow lands on onboarding, not the Library.

Never use a production account. The flow refuses to sign in unless the app says it is on the development environment with the Clerk test instance.

## Each run

1. Start the dev server: `npm run start:dev`.
2. In another terminal, with the credentials in your shell (not in any file in the repo):

   ```
   export FLIPBOOK_TEST_EMAIL='smoke+clerk_test@yourdomain.com'
   export FLIPBOOK_TEST_PASSWORD='…'
   npm run smoke
   ```

   On an Android emulator the Mac is `10.0.2.2`, so also set `FLIPBOOK_DEV_SERVER_URL=http://10.0.2.2:8081`. The default is `http://localhost:8081`, which suits the iOS Simulator.

## What the flow does

1. Clears the app's data, launches it with notifications denied, and opens the dev-client link so it loads from your dev server.
2. **Production guard:** waits for the "Flipbook Dev · development · Clerk test" line at the bottom of the screen and stops if it says anything else, including "Clerk live".
3. Signs in with the email and password.
4. Enters `424242` only if Clerk asks for an email code; dismisses the one-time education pop-up only if it appears.
5. Opens the Library tab and checks the "Reading" and "Finished" tabs are there.

## Selectors

v1 screens have no `testID`s, so the flow taps on visible text. Changing the wording of "Sign in here", "Email address", "Password", "Sign in", "Library", "Reading" or "Finished" breaks it. v2 components all take a `testID` (`CLAUDE.md`, Flipbook v2 rules).
