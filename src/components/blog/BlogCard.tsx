import Link from "next/link";
import { BlogCover } from "./BlogCover";
import { formatPostDate, type PostMeta } from "@/lib/blog";

/**
 * Card styling tracks the FAQ rows and plan cards: `neon-teal` glow, the same
 * border and surface pair, so the blog does not read as a bolt-on.
 */
export function BlogCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="neon-teal group flex h-full flex-col overflow-hidden rounded-2xl border border-pine/10 bg-white shadow-sm dark:border-white/10 dark:bg-night/40"
    >
      <BlogCover
        tone={post.tone}
        className="aspect-[16/10] transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium text-stone dark:text-white/50">
          {formatPostDate(post.date)} · {post.readingTime}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-pine group-hover:text-teal-ink dark:text-white dark:group-hover:text-lime">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone dark:text-white/60">
          {post.excerpt}
        </p>
      </div>
    </Link>
  );
}
