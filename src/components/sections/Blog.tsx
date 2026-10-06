import Link from "next/link";
import { Reveal } from "../Reveal";
import { PlusField } from "../PlusField";
import { TopoBackground } from "../TopoBackground";
import { AnimatedSection } from "../AnimatedSection";
import { BlogCard } from "../blog/BlogCard";
import { getAllPosts } from "@/lib/blog";

/**
 * The three newest posts, with a link through to the full index.
 *
 * A server component, like FinalCta: the post list is build-time data from
 * `blog-data.ts`, and keeping the section on the server means only the three
 * cards' metadata reaches the client, not every post's compiled HTML.
 *
 * Renders nothing at all when there are no posts, so emptying `content/blog/`
 * removes the section rather than leaving a heading over a blank grid.
 */
export function Blog() {
  const posts = getAllPosts().slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <AnimatedSection id="blog" className="relative overflow-hidden py-20">
      <TopoBackground className="text-pine/[0.06] dark:text-white/[0.05]" />
      <PlusField density="heavy" className="text-lime/60 dark:text-lime/25" />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-ink">
            Blogs
          </p>
          {/* Deliberately not the blog index's own heading and intro. Running
              identical copy on / and /blog would be duplicate content on the
              two pages most likely to rank for the same terms. */}
          <h2 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
            The process, written down.
          </h2>
          <p className="mt-4 text-stone dark:text-white/60">
            The research we do before a first meeting, where AI sits in the
            work, and the approval gate every deliverable passes through.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.1}>
              <BlogCard post={post} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <div className="mt-10 text-center">
            <Link
              href="/blog"
              className="neon-teal-btn inline-flex items-center gap-2 rounded-full border border-pine/15 px-6 py-3 text-sm font-semibold text-pine transition-colors hover:border-teal hover:text-teal-ink dark:border-white/15 dark:text-white dark:hover:border-lime dark:hover:text-lime"
            >
              Read the blog
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </AnimatedSection>
  );
}
