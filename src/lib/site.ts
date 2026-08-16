/**
 * Canonical site configuration.
 *
 * NOTE: `url` drives canonical tags, sitemap entries, and OG image resolution.
 * Set NEXT_PUBLIC_SITE_URL in the Vercel project to the real production domain.
 * The fallback below is a guess based on the contact address in the footer and
 * should be confirmed before launch — a wrong value here silently breaks
 * canonicals and social previews.
 */
export const siteConfig = {
  name: "Sublime+",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://sublimeplus.co",
  tagline: "Content & social marketing, done with a little extra",
  description:
    "Sublime+ writes, posts, and manages content and social for brands who'd rather be doing anything else. Creative, reliable, social-savvy.",
  email: "hello@sublimeplus.co",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
