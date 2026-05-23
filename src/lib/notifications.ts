import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useMutation } from "convex/react";

import { api } from "../../convex/_generated/api";

// FR-028: app boot (after onboarding) registers an Expo push token on the
// user record. Permission prompt deliberately runs AFTER the Convex user
// exists so it doesn't blast a permission dialog at first sign-in.

// Configure how notifications are presented while the app is foregrounded.
// `shouldShowBanner` + `shouldShowList` cover iOS 14+ behavior. The legacy
// `shouldShowAlert` is preserved for older OSes.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function expoProjectId(): string | null {
  // Try the static + runtime sources expo-constants exposes — different
  // build flavors populate different fields.
  const fromEas =
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants.easConfig as { projectId?: string } | undefined)?.projectId;
  if (typeof fromEas === "string" && fromEas.length > 0) return fromEas;
  return null;
}

// Returns the new token if anything changed, null if no-op.
async function registerOnce(): Promise<string | null> {
  if (!Device.isDevice) return null; // Push tokens aren't issued in simulators.

  const projectId = expoProjectId();
  if (!projectId) {
    console.warn("expo push: missing EAS projectId; skipping token registration");
    return null;
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== "granted") return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}

/**
 * Mount once an authenticated Convex user exists. Registers the push token
 * (idempotent — server-side patch no-ops when unchanged) and listens for
 * token rotation events.
 */
export function usePushTokenRegistration(meExists: boolean): void {
  const updatePushToken = useMutation(api.users.updatePushToken);
  const tried = useRef(false);

  useEffect(() => {
    if (!meExists || tried.current) return;
    tried.current = true;
    registerOnce()
      .then((token) => {
        if (token) {
          updatePushToken({ pushToken: token }).catch((err) => {
            console.warn("expo push: failed to persist token", err);
          });
        }
      })
      .catch((err) => {
        console.warn("expo push: registration failed", err);
      });

    // FR-028 acceptance: token is updated if it changes (rotation).
    const sub = Notifications.addPushTokenListener((event) => {
      updatePushToken({ pushToken: event.data }).catch(() => undefined);
    });
    return () => sub.remove();
  }, [meExists, updatePushToken]);
}
