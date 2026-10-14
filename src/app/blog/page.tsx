import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { TopoBackground } from "@/components/TopoBackground";
import { PlusField } from "@/components/PlusField";
import { BlogCard } from "@/components/blog/BlogCard";
import { getAllPosts } from "@/lib/blog";

const TITLE = "Blog | Sublime Plus: LLM Marketing, SEO and Reddit Insights";
const DESCRIPTION =
  "The Sublime Plus blog on LLM marketing, SEO and Reddit. How brands get found on Google and named in ChatGPT, Gemini and Perplexity answers.";

export const metadata: Metadata = {
  // Absolute, so the layout's "%s | Sublime Plus" template does not append
  // the brand a second time.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: "/blog",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
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
            LLM marketing and SEO, explained plainly.
          </h1>
          <p className="mt-4 text-stone dark:text-white/60">
            Notes from the Sublime+ team on getting your brand found on Google,
            discussed on Reddit and recommended by AI tools like ChatGPT and
            Gemini.
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
