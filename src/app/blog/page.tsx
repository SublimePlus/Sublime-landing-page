import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { TopoBackground } from "@/components/TopoBackground";
import { PlusField } from "@/components/PlusField";
import { BlogCard } from "@/components/blog/BlogCard";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "How Sublime Plus works: our research, approval and AI-usage processes, written up from the SOPs we run on.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: "Blog",
    description:
      "How Sublime Plus works: our research, approval and AI-usage processes, written up from the SOPs we run on.",
    url: "/blog",
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="relative overflow-hidden pb-28 pt-40">
      <TopoBackground className="text-pine/[0.06] dark:text-white/[0.05]" />
      <PlusField density="light" className="text-lime/60 dark:text-lime/25" />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-ink">
            Sublime Plus Blog
          </p>
          <h1 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
            How we actually work.
          </h1>
          <p className="mt-4 text-stone dark:text-white/60">
            Written up from the standard operating procedures we run on — the
            research we do before a first meeting, where AI sits in the work,
            and what has to happen before anything goes live.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={Math.min(i, 6) * 0.08}>
              <BlogCard post={post} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
