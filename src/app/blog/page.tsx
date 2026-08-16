import { Reveal } from "@/components/Reveal";
import { BlogCard } from "@/components/BlogCard";
import { getAllPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog | Sublime+",
  description: "Notes on content, social, and growth from the Sublime+ team.",
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-6xl px-6 pb-28 pt-40">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-ink">
          Sublime+ Blog
        </p>
        <h1 className="text-4xl font-bold text-pine dark:text-white">
          Notes on content that works.
        </h1>
      </Reveal>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {posts.map((post, i) => (
          <Reveal key={post.slug} delay={i * 0.08}>
            <BlogCard post={post} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
