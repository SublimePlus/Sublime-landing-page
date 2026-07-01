import Link from "next/link";
import { Reveal } from "../Reveal";
import { BlogCard } from "../BlogCard";
import { getAllPosts } from "@/lib/blog";

export function BlogPreview() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <Reveal className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal">
            From the blog
          </p>
          <h2 className="text-3xl font-bold text-pine sm:text-4xl">
            Notes on content that works.
          </h2>
        </div>
        <Link
          href="/blog"
          className="whitespace-nowrap text-sm font-semibold text-teal hover:text-pine"
        >
          View all posts →
        </Link>
      </Reveal>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {posts.map((post, i) => (
          <Reveal key={post.slug} delay={i * 0.1}>
            <BlogCard post={post} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
