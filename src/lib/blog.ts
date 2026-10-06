import { RAW_POSTS } from "./blog-data";

/**
 * Posts are authored as Markdown in `content/blog/` and compiled into
 * `blog-data.ts` at build time by `scripts/build-blog-data.mjs`.
 *
 * Nothing here touches the filesystem, and no Markdown is compiled at request
 * time. That is a hard requirement rather than an optimisation: the site runs
 * on Cloudflare Workers via OpenNext with no incremental cache configured, so
 * pages re-render inside the Worker on request — where there is no filesystem
 * to read `content/` from, and no `eval` for a Markdown compiler to use.
 */

/** Tone picks the generated cover's gradient. There is no cover photography. */
export const TONES = ["teal", "pine", "lime"] as const;
export type PostTone = (typeof TONES)[number];

/** The shape the generator emits. */
export type RawPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tone: PostTone;
  readingTime: string;
  /** Compiled at build time from the post's Markdown body. */
  html: string;
};

export type PostMeta = Omit<RawPost, "html">;

/**
 * Newest first — the generator emits them in that order.
 *
 * `html` is dropped rather than carried along: the index renders cards, and
 * every field returned here is serialised into that page's payload.
 */
export function getAllPosts(): PostMeta[] {
  return RAW_POSTS.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    tone: post.tone,
    readingTime: post.readingTime,
  }));
}

export function getPostBySlug(slug: string): RawPost | null {
  return RAW_POSTS.find((post) => post.slug === slug) ?? null;
}

/** Other posts, newest first, for the "keep reading" row under an article. */
export function getOtherPosts(slug: string, limit = 2): PostMeta[] {
  return getAllPosts()
    .filter((post) => post.slug !== slug)
    .slice(0, limit);
}

export function formatPostDate(date: string, month: "short" | "long" = "short") {
  return new Date(date).toLocaleDateString("en-US", {
    month,
    day: "numeric",
    year: "numeric",
  });
}
