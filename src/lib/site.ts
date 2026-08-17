/**
 * Single source of truth for site-level identity.
 *
 * `NEXT_PUBLIC_SITE_URL` drives canonical URLs, Open Graph image resolution,
 * the sitemap and robots.txt. Set it in the production environment the moment
 * a real domain exists, and it overrides everything below.
 *
 * The fallback is the live Vercel production URL rather than a guessed brand
 * domain, so that until the env var is set the canonicals point at where the
 * site actually is, not at a domain that may not be owned. Update the fallback
 * (or better, set the env var) when a custom domain goes live.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://sublime-landing-page.vercel.app";

export const site = {
  name: "Sublime+",
  /**
   * Plain-language definition. Language models resolve entities from explicit
   * definitional statements, so this stays literal — the brand tagline does the
   * personality work in the hero, not here.
   *
   * Traceable to SOP-S01 §5.2 (core qualifying question: visibility on Reddit,
   * in search engines, and in how LLMs perceive the brand), SOP-002 §4 (content
   * types) and SOP-U01 §4 (UGC product lines).
   */
  description:
    "Sublime+ is a content and social marketing agency. We plan, write and post Reddit content (posts, comments and replies) to improve how brands appear in search results and in how AI language models describe them, and we produce AI-generated visual content through our UGC product line.",
  tagline: "Content & social marketing, done with a little extra",
  email: "try.sublime.plus@gmail.com",
  locale: "en_US",
  /** Real, verified profiles. Also emitted as Organization sameAs. */
  socials: {
    tiktok: "https://www.tiktok.com/@sublimeplus_",
    instagram: "https://www.instagram.com/sublimeplus_/",
    facebook: "https://www.facebook.com/profile.php?id=61592610954773",
  },
} as const;

export const socialLinks = [
  { label: "TikTok", href: site.socials.tiktok },
  { label: "Instagram", href: site.socials.instagram },
  { label: "Facebook", href: site.socials.facebook },
] as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}
