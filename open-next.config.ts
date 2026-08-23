import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Defaults are deliberate: this is a static marketing site with no ISR, no
 * server-side data fetching and no cache to configure. Caching options go here
 * if that changes — see https://opennext.js.org/cloudflare/caching
 */
export default defineCloudflareConfig();
