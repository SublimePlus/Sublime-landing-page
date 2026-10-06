import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { BlogCover } from "@/components/blog/BlogCover";
import { BlogCard } from "@/components/blog/BlogCard";
import { BookMeetingButton } from "@/components/booking/BookMeetingButton";
import {
  JsonLd,
  blogPostingSchema,
  breadcrumbSchema,
} from "@/components/JsonLd";
import {
  formatPostDate,
  getAllPosts,
  getOtherPosts,
  getPostBySlug,
} from "@/lib/blog";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

/**
 * `dynamicParams` is deliberately left on. Setting it to false makes the Worker
 * serve these pages only from the incremental cache, which this project does
 * not configure (see `open-next.config.ts`) — every article then 404s in
 * production even though it prerendered fine. Leaving it on lets an uncached
 * request re-render from the bundled post data instead. An unknown slug is
 * still a 404: `getPostBySlug` returns null and the page calls `notFound()`.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const meta = post;
  const url = `/blog/${slug}`;

  return {
    title: meta.title,
    description: meta.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: meta.title,
      description: meta.excerpt,
      url,
      publishedTime: meta.date,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.excerpt,
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { html, ...meta } = post;
  const more = getOtherPosts(slug);

  return (
    /**
     * No TopoBackground here, unlike the index and the homepage sections. Its
     * scattered marks render as full-opacity lime "stars" in light mode, which
     * works behind cards and headings but lands on top of paragraph text in a
     * single narrow column. An article is a reading surface, so it gets the
     * plain page background.
     */
    <div className="relative overflow-hidden pb-28 pt-40">
      <article className="relative mx-auto max-w-3xl px-6">
        <JsonLd schema={blogPostingSchema(meta)} />
        <JsonLd schema={breadcrumbSchema(meta)} />

        <Reveal>
          <Link
            href="/blog"
            className="text-sm font-medium text-teal-ink transition-colors hover:text-pine dark:hover:text-lime"
          >
            ← All posts
          </Link>
          <p className="mt-6 mb-3 text-sm font-medium text-stone dark:text-white/60">
            {formatPostDate(meta.date, "long")} · {meta.readingTime}
          </p>
          <h1 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
            {meta.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-stone dark:text-white/60">
            {meta.excerpt}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <BlogCover
            tone={meta.tone}
            badgeSize="lg"
            className="mt-8 aspect-[16/9] rounded-2xl"
          />
        </Reveal>

        <Reveal delay={0.15}>
          <div
            className="prose mt-10 max-w-none prose-headings:font-semibold prose-headings:text-pine prose-p:leading-relaxed prose-p:text-stone prose-strong:text-pine prose-li:text-stone dark:prose-invert dark:prose-headings:text-white dark:prose-p:text-white/70 dark:prose-strong:text-white dark:prose-li:text-white/70"
            // Compiled at build time by scripts/build-blog-data.mjs from
            // Markdown committed to this repo. No user input reaches it, and
            // raw HTML in a post is escaped rather than passed through.
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass-panel mt-16 rounded-2xl px-6 py-8 text-center">
            <h2 className="text-xl font-semibold text-pine dark:text-white">
              Want this run on your brand?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-stone dark:text-white/60">
              We will walk you through what the models currently say about you,
              and what it would take to change it.
            </p>
            <BookMeetingButton className="neon-teal-btn mt-6 rounded-full bg-pine px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal dark:bg-teal dark:hover:bg-teal-dark">
              Book a Call
            </BookMeetingButton>
          </div>
        </Reveal>

        {more.length > 0 && (
          <div className="mt-20">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-ink">
              Keep reading
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {more.map((other, i) => (
                <Reveal key={other.slug} delay={i * 0.08}>
                  <BlogCard post={other} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
