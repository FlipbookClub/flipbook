/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as books from "../books.js";
import type * as chapters from "../chapters.js";
import type * as clubs from "../clubs.js";
import type * as email from "../email.js";
import type * as http from "../http.js";
import type * as invites from "../invites.js";
import type * as lib_admins from "../lib/admins.js";
import type * as lib_inviteCode from "../lib/inviteCode.js";
import type * as memberships from "../memberships.js";
import type * as notifications from "../notifications.js";
import type * as progress from "../progress.js";
import type * as reactions from "../reactions.js";
import type * as users from "../users.js";
import type * as waitlist from "../waitlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  books: typeof books;
  chapters: typeof chapters;
  clubs: typeof clubs;
  email: typeof email;
  http: typeof http;
  invites: typeof invites;
  "lib/admins": typeof lib_admins;
  "lib/inviteCode": typeof lib_inviteCode;
  memberships: typeof memberships;
  notifications: typeof notifications;
  progress: typeof progress;
  reactions: typeof reactions;
  users: typeof users;
  waitlist: typeof waitlist;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
