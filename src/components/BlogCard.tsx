import Link from "next/link";
import { PlusMark } from "./PlusMark";
import type { PostMeta } from "@/lib/blog";

export function BlogCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="neon-teal group block overflow-hidden rounded-2xl border border-pine/10 bg-white shadow-sm dark:border-white/10 dark:bg-night/40"
    >
      <div className={`relative aspect-[16/10] overflow-hidden duotone-${post.duotone}`}>
        <div
          className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${post.cover})` }}
        />
        <span className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-lime text-pine">
          <PlusMark className="h-4 w-4" strokeWidth={3} />
        </span>
      </div>
      <div className="p-5">
        <p className="text-xs font-medium text-stone dark:text-white/50">
          {new Date(post.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}{" "}
          · {post.readingTime}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-pine group-hover:text-teal dark:text-white dark:group-hover:text-lime">
          {post.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-stone line-clamp-2 dark:text-white/60">
          {post.excerpt}
        </p>
      </div>
    </Link>
  );
}
