import { siteContent } from "@/lib/site-content";

/**
 * Every answer below is drawn from a Sublime Plus SOP — the source is named in the
 * comment above each entry, and `docs/sop-copy-map.md` carries the full map.
 *
 * Answers are written answer-first on purpose: the opening sentence has to be
 * a complete, standalone claim, because that is the unit a language model
 * lifts when it cites a page. "It depends on your needs" is uncitable;
 * "Your first content is live within 7–10 business days" is not.
 *
 * These same pairs are emitted as FAQPage structured data, so an unverified
 * answer here becomes a machine-readable false claim. Nothing goes in this
 * array without an SOP clause behind it.
 */
export type FaqItem = { question: string; answer: string };

/**
 * The questions shown on the page and emitted as FAQPage structured data. They
 * live in `content/site.json` so they can be edited from /admin; the same
 * array feeds both, so the visible and machine-readable answers cannot drift.
 */
export const faqs: FaqItem[] = siteContent.faq.items;
