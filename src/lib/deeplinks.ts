import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import type { LinkingOptions } from "@react-navigation/native";

import { storage } from "@/lib/storage";

// Deep-link configuration.
//   flipbook://join/ABC123                         — invite (custom scheme)
//   https://useflipbook.com/join/ABC123            — invite (universal link)
//   flipbook://clubs/<clubId>/chapters/<chapterId> — chapter-drop push (FR-029)
//   flipbook://clubs/<clubId>/books/<bookId>       — book deep link
//
// React Navigation matches the path to a nested screen route. Unauthenticated
// users land on the regular AuthStack; we don't currently buffer the pending
// invite across auth — that improvement is a TODO for after Phase 2.
export const linkingConfig: LinkingOptions<ReactNavigation.RootParamList>["config"] = {
  screens: {
    // Auth-stack mirrors (so deep links from a logged-out state still resolve).
    Welcome: "welcome",
    CreateAccount: "signup",
    SignIn: "signin",
    // The Main app: tabs > Community stack > screens.
    Community: {
      path: "",
      screens: {
        CommunityHome: "community",
        InviteAccept: "join/:inviteCode",
        ClubDetail: "clubs/:clubId",
        // Reader accepts either bookId or chapterId — push notifications
        // from Phase 5 fanouts route here with chapterId; reaction-reply
        // pushes (also Phase 5) use the same shape with an optional ?page=.
        Reader: {
          path: "clubs/:clubId/chapters/:chapterId",
          parse: {
            chapterId: (v: string) => v,
            jumpToPage: (v: string) => parseInt(v, 10),
          },
        },
      },
    },
  },
};

export const linkingPrefixes = [
  Linking.createURL("/"),
  "flipbook://",
  "https://useflipbook.com",
];

// Notification payloads from convex/notifications.ts always include a
// `deepLink` string in their data (chapter drops, reaction replies). We
// inject that into React Navigation's linking pipeline so taps route to
// the right screen — TASK-089 covers the cold-start case where the app
// was killed when the push arrived.
function extractDeepLink(response: Notifications.NotificationResponse | null): string | null {
  const data = response?.notification.request.content.data as { deepLink?: unknown } | undefined;
  const deepLink = data?.deepLink;
  return typeof deepLink === "string" && deepLink.length > 0 ? deepLink : null;
}

// `getLastNotificationResponseAsync` does not clear after read — it keeps
// returning the same response across cold launches until a newer one
// arrives. Without a dedupe guard, a user who taps a push, then later
// opens the app normally, would be re-routed to that stale notification.
// We persist the consumed request ID in MMKV and skip if seen.
const LAST_CONSUMED_KEY = "deeplink:lastConsumedNotificationId";

export async function getInitialURL(): Promise<string | null> {
  // 1. A real URL the OS handed us (universal link, custom scheme, or
  //    Expo dev-client launch URL) always wins.
  const url = await Linking.getInitialURL();
  if (url != null) return url;

  // 2. Otherwise, see if the app was launched by tapping a push notification.
  const last = await Notifications.getLastNotificationResponseAsync();
  if (last == null) return null;
  const requestId = last.notification.request.identifier;
  if (storage.getString(LAST_CONSUMED_KEY) === requestId) return null;
  storage.set(LAST_CONSUMED_KEY, requestId);
  return extractDeepLink(last);
}

export function subscribeToURL(listener: (url: string) => void): () => void {
  const linkingSub = Linking.addEventListener("url", ({ url }) => listener(url));
  const notifSub = Notifications.addNotificationResponseReceivedListener((response) => {
    const requestId = response.notification.request.identifier;
    storage.set(LAST_CONSUMED_KEY, requestId);
    const deepLink = extractDeepLink(response);
    if (deepLink != null) listener(deepLink);
  });
  return () => {
    linkingSub.remove();
    notifSub.remove();
  };
}
