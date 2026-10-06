import { ImageResponse } from "next/og";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

/**
 * Per-post social card, generated at build time from the post's own title in
 * the same gradient as the site card. An article's share preview is most of
 * what a blog is for, and this keeps it from falling back to the generic
 * homepage image.
 */
export default async function BlogPostOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const title = post?.title ?? site.name;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0E1F19 0%, #1B3A2F 55%, #3C866B 100%)",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 30,
            fontWeight: 700,
            color: "#C9F24E",
          }}
        >
          Sublime
          <span style={{ fontSize: 22, marginTop: -14 }}>+</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 70 ? 54 : 64,
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "rgba(255,255,255,0.72)" }}>
          {site.name} · Blog
        </div>
      </div>
    ),
    size
  );
}
