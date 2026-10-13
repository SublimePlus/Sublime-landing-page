/**
 * Copies the prerendered pages OpenNext wrote to `.open-next/cache` into the
 * Worker's static assets, where the static-assets incremental cache reads
 * them (see open-next.config.ts).
 *
 * `opennextjs-cloudflare deploy` does this copy itself, but a deploy run as a
 * plain `wrangler deploy` (as Workers Builds may) does not — the pages would
 * then silently fall back to rendering in the Worker on every request. Doing
 * it at the end of `npm run build` makes it hold whichever command deploys.
 * Re-running it is harmless; the deploy-time copy writes the same files.
 */
import fs from "node:fs";
import path from "node:path";

const from = path.join(process.cwd(), ".open-next", "cache");
const to = path.join(process.cwd(), ".open-next", "assets", "cdn-cgi", "_next_cache");

if (!fs.existsSync(from)) {
  console.error("copy-static-cache: .open-next/cache not found; run the OpenNext build first.");
  process.exit(1);
}

fs.cpSync(from, to, { recursive: true });
console.log("copy-static-cache: prerendered pages copied into Worker assets");
