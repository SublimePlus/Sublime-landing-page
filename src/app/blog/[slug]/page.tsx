import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { Reveal } from "@/components/Reveal";
import { PlusMark } from "@/components/PlusMark";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const { meta } = getPostBySlug(slug);
    const canonical = `/blog/${slug}`;

    return {
      title: meta.title,
      description: meta.excerpt,
      alternates: { canonical },
      openGraph: {
        type: "article",
        title: meta.title,
        description: meta.excerpt,
        url: canonical,
        publishedTime: new Date(meta.date).toISOString(),
      },
      twitter: {
        card: "summary_large_image",
        title: meta.title,
        description: meta.excerpt,
      },
    } satisfies Metadata;
  } catch {
    return {};
  }
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  const { meta, content } = post;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: meta.title,
    description: meta.excerpt,
    datePublished: new Date(meta.date).toISOString(),
    mainEntityOfPage: absoluteUrl(`/blog/${slug}`),
    author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
  };

  return (
    <article className="mx-auto max-w-3xl px-6 pb-28 pt-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Reveal>
        <p className="mb-3 text-sm font-medium text-stone dark:text-white/60">
          <time dateTime={new Date(meta.date).toISOString()}>
            {new Date(meta.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>{" "}
          · {meta.readingTime}
        </p>
        <h1 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
          {meta.title}
        </h1>
      </Reveal>

      <Reveal delay={0.1}>
        <div className={`relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl duotone-${meta.duotone}`}>
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${meta.cover})` }}
          />
          <span className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-lime text-pine">
            <PlusMark className="h-4 w-4" strokeWidth={3} />
          </span>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="prose prose-headings:font-semibold prose-headings:text-pine prose-p:text-stone prose-p:leading-relaxed prose-strong:text-pine dark:prose-invert dark:prose-headings:text-white dark:prose-p:text-white/70 dark:prose-strong:text-white mt-10 max-w-none">
          <MDXRemote source={content} />
        </div>
      </Reveal>
    </article>
  );
}
