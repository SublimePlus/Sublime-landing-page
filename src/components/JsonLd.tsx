import { absoluteUrl, site, siteUrl, socialLinks } from "@/lib/site";
import type { FaqItem } from "@/lib/faq";

/**
 * Structured data.
 *
 * Structured data is the most liftable form of a claim on the page — it is what
 * a language model quotes back as fact, stripped of any hedging around it. So
 * everything emitted here has to be traceable to an SOP clause, and the ones
 * that are not traceable are named below rather than quietly approximated.
 *
 * Deliberately absent: Review and AggregateRating. There is no legitimate
 * review data behind the site, and emitting either would be fabricating
 * machine-readable claims — a worse version of the same problem as invented
 * testimonials. Add them only when real, attributable reviews exist.
 *
 * Offers carry no `price`. SOP-S01 §10.5 documents the package prices, but the
 * decision is to present them on the call rather than on the page; asserting a
 * price in schema while withholding it in the copy would be the worst of both.
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
  // Real, verified profiles. sameAs is how a search engine or language model
  // ties this entity to its social presence.
  sameAs: socialLinks.map((s) => s.href),
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

/**
 * FAQPage over the SOP-sourced Q&A in `Faq.tsx`. This is the single most
 * directly citable structure on the site, which is exactly why it is generated
 * from the same array the page renders — the visible answer and the
 * machine-readable answer cannot drift apart.
 */
export function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl}/#faq`,
    inLanguage: "en",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/**
 * The service Sublime+ sells, with the three SOP-S01 §10.5 packages as offers.
 * Volumes come from that same clause; nothing is inferred.
 */
export const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${siteUrl}/#service`,
  name: "Reddit content and social marketing",
  serviceType: "Content marketing",
  provider: { "@id": ORGANIZATION_ID },
  description:
    "Planning, writing and posting Reddit content (posts, comments and replies) to improve a brand's search rankings and how AI language models describe it.",
  // SOP-S01 §5.1 — the three Ideal Client Profile segments.
  audience: [
    { "@type": "Audience", audienceType: "B2B companies improving brand visibility and SEO" },
    { "@type": "Audience", audienceType: "E-commerce brands seeking product awareness" },
    { "@type": "Audience", audienceType: "Local businesses strengthening their online presence" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Sublime+ packages",
    itemListElement: [
      {
        "@type": "Offer",
        name: "Starter",
        description: "10 posts per month with supporting comments included. Billed monthly, upfront.",
      },
      {
        "@type": "Offer",
        name: "Growth",
        description: "25 posts per month with supporting comments included. Billed monthly, upfront.",
      },
      {
        "@type": "Offer",
        name: "Pro",
        description:
          "30 posts per month with supporting comments included, AI-generated plus a human proofread. Billed monthly, upfront.",
      },
    ],
  },
};

