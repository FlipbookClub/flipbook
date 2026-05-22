import * as Linking from "expo-linking";
import type { LinkingOptions } from "@react-navigation/native";

// Deep-link configuration for invite URLs.
//   flipbook://join/ABC123        — custom scheme (dev + native)
//   https://flipbook.app/join/ABC123 — universal/app link (production)
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
    // The Main app: tabs > Community stack > InviteAccept.
    Community: {
      path: "",
      screens: {
        CommunityHome: "community",
        InviteAccept: "join/:inviteCode",
        ClubDetail: "club/:clubId",
      },
    },
  },
};

export const linkingPrefixes = [
  Linking.createURL("/"),
  "flipbook://",
  "https://flipbook.app",
];
