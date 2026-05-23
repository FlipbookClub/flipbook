import * as Linking from "expo-linking";
import type { LinkingOptions } from "@react-navigation/native";

// Deep-link configuration.
//   flipbook://join/ABC123                         — invite (custom scheme)
//   https://flipbook.app/join/ABC123               — invite (universal link)
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
  "https://flipbook.app",
];
