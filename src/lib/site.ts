/**
 * Single source of truth for site-level identity.
 *
 * `NEXT_PUBLIC_SITE_URL` must be set in the production environment — it drives
 * canonical URLs, Open Graph image resolution, the sitemap and robots.txt.
 * The fallback below keeps local development and preview builds working; it is
 * deliberately obvious so a missing env var is caught in review rather than
 * silently shipping wrong canonicals.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://sublimeplus.co";

export const site = {
  name: "Sublime+",
  /**
   * Plain-language definition. Language models resolve entities from explicit
   * definitional statements, so this stays literal — the brand tagline does the
   * personality work in the hero, not here.
   */
  description:
    "Sublime+ is a content and social marketing agency. We plan, write, and publish content for brands, and produce AI-generated visual content through our UGC product line.",
  tagline: "Content & social marketing, done with a little extra",
  email: "hello@sublimeplus.co",
  locale: "en_US",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}
