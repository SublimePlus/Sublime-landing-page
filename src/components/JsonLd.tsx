import { absoluteUrl, site, siteUrl } from "@/lib/site";
import type { PostMeta } from "@/lib/blog";

/**
 * Structured data.
 *
 * Deliberately absent: Review and AggregateRating. There is no legitimate
 * review data behind the site, and emitting either would be fabricating
 * machine-readable claims — a worse version of the same problem as invented
 * testimonials. Add them only when real, attributable reviews exist.
 *
 * Also absent: Service and Offer schema. Those require a settled list of what
 * is actually sold and at what scope, which is still pending sign-off.
 */
export function JsonLd({ schema }: { schema: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Serialised server-side from values we control; no user input reaches this.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

const ORGANIZATION_ID = `${siteUrl}/#organization`;

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: site.name,
  url: siteUrl,
  description: site.description,
  email: site.email,
  logo: {
    "@type": "ImageObject",
    url: absoluteUrl("/icon.svg"),
  },
  // sameAs is omitted until real social profile URLs exist. An empty or
  // placeholder sameAs is worse than none — it asserts profiles that aren't there.
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  url: siteUrl,
  name: site.name,
  description: site.description,
  publisher: { "@id": ORGANIZATION_ID },
  inLanguage: "en",
};

export function blogPostingSchema(post: PostMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": absoluteUrl(`/blog/${post.slug}#article`),
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    image: post.cover,
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    inLanguage: "en",
  };
}

export function breadcrumbSchema(post: PostMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
      { "@type": "ListItem", position: 3, name: post.title },
    ],
  };
}
