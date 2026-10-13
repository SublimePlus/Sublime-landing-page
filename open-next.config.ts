import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/**
 * Cloudflare is the only deploy target, so `npm run build` produces the Worker
 * rather than a bare `.next` directory — Workers Builds fails on the latter.
 *
 * `buildCommand` is what makes that safe. The adapter shells out to the app's
 * build script to produce `.next` before bundling, and that defaults to
 * `npm run build`, which would re-enter the adapter and recurse forever.
 * Pointing it at `build:next` breaks the cycle, so `build` and `cf-build` both
 * emit a deployable Worker and the dashboard can call either one.
 *
 * Caching: pages are served from the HTML prerendered at build time instead
 * of being re-rendered in the Worker on every request. Rendering React per
 * request costs more CPU than the Workers free plan allows (~10ms), which
 * surfaced as intermittent error 1102 "Worker exceeded resource limits".
 *
 * The static-assets cache is read-only, which fits this site exactly: there
 * is no ISR or revalidation, and blog edits from /admin are commits that
 * trigger a fresh build. Cache interception answers a cached page before the
 * Next.js server is even loaded. See https://opennext.js.org/cloudflare/caching
 */
const config = {
  ...defineCloudflareConfig({
    incrementalCache: staticAssetsIncrementalCache,
    enableCacheInterception: true,
  }),
  buildCommand: "npm run build:next",
};

export default config;
