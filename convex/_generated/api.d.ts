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
import type * as lib_inviteCode from "../lib/inviteCode.js";
import type * as memberships from "../memberships.js";
import type * as notifications from "../notifications.js";
import type * as progress from "../progress.js";
import type * as reactions from "../reactions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  books: typeof books;
  chapters: typeof chapters;
  clubs: typeof clubs;
  "lib/inviteCode": typeof lib_inviteCode;
  memberships: typeof memberships;
  notifications: typeof notifications;
  progress: typeof progress;
  reactions: typeof reactions;
  users: typeof users;
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
