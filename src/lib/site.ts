/**
 * Single source of truth for site-level identity.
 *
 * `NEXT_PUBLIC_SITE_URL` drives canonical URLs, Open Graph image resolution,
 * the sitemap and robots.txt. Set it in the production environment to override
 * everything below.
 *
 * The fallback is the production domain, which is live on Cloudflare Workers
 * and is the origin Google should index. Keep it pointing at the domain the
 * site actually serves from, so canonicals stay correct even when the env var
 * is unset.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://sublime-plus.com";

export const site = {
  name: "Sublime Plus",
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
    "Sublime Plus is a content and social marketing agency. We plan, write and post Reddit content (posts, comments and replies) to improve how brands appear in search results and in how AI language models describe them, and we produce AI-generated visual content through our UGC product line.",
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
