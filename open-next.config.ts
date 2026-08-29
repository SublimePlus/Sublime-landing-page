import { defineCloudflareConfig } from "@opennextjs/cloudflare";

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
 * Caching options would go here too; there is no ISR or server-side data
 * fetching on this site. See https://opennext.js.org/cloudflare/caching
 */
const config = {
  ...defineCloudflareConfig(),
  buildCommand: "npm run build:next",
};

export default config;
