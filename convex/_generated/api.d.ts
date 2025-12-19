/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as academic from "../academic.js";
import type * as activity_logs from "../activity_logs.js";
import type * as analytics from "../analytics.js";
import type * as articles from "../articles.js";
import type * as comments from "../comments.js";
import type * as lib_tracking from "../lib/tracking.js";
import type * as lib_trackingSchemas from "../lib/trackingSchemas.js";
import type * as seed from "../seed.js";
import type * as seed_data from "../seed_data.js";
import type * as settings from "../settings.js";
import type * as tracking from "../tracking.js";
import type * as users from "../users.js";
import type * as verify_data from "../verify_data.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  academic: typeof academic;
  activity_logs: typeof activity_logs;
  analytics: typeof analytics;
  articles: typeof articles;
  comments: typeof comments;
  "lib/tracking": typeof lib_tracking;
  "lib/trackingSchemas": typeof lib_trackingSchemas;
  seed: typeof seed;
  seed_data: typeof seed_data;
  settings: typeof settings;
  tracking: typeof tracking;
  users: typeof users;
  verify_data: typeof verify_data;
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
