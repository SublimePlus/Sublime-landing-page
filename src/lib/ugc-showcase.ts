/**
 * Slides for the UGC carousel — the four SOP-U01 §4 product lines.
 *
 * `imageUrl` is intentionally unset on every slide. Until real deliverables
 * exist, each card renders a branded panel instead of a photograph: stock
 * imagery sitting under a "here's what we make" heading is a fabricated work
 * sample, which SOP-007 §4 rules out, and nothing on the card claims otherwise
 * — the button reads "Sample coming soon".
 *
 * To swap in real work: drop the files into `public/showcase/`, set `imageUrl`
 * to the local path (e.g. "/showcase/faceless-01.jpg"), and update `meta` to
 * describe the actual piece. Nothing else needs to change — the card switches
 * from the placeholder to the image automatically.
 */
export type ShowcaseSlide = {
  imageUrl?: string;
  category: string;
  title: string;
  meta: string;
  /** HSL triple driving the card's glow and scrim. Brand greens throughout. */
  themeColor: string;
};

export const ugcShowcase: ShowcaseSlide[] = [
  {
    // SOP-U01 §4.1
    category: "Line 1",
    title: "Faceless Content",
    meta: "Your product, any setting — no model, no shoot",
    themeColor: "158 39% 39%",
  },
  {
    // SOP-U01 §4.2
    category: "Line 2",
    title: "AI Avatar Models",
    meta: "One consistent AI model across every deliverable",
    themeColor: "168 34% 30%",
  },
  {
    // SOP-U01 §4.3
    category: "Line 3",
    title: "Brand Ambassadors",
    meta: "A recurring face — yours, or one we build",
    themeColor: "146 45% 26%",
  },
  {
    // SOP-U01 §4.4
    category: "Line 4",
    title: "AI Influencers",
    meta: "Sponsored posts on our creator accounts, AI-labelled",
    themeColor: "174 32% 22%",
  },
];
