import raw from "../../content/site.json";

/**
 * Editable copy for the main website, stored in `content/site.json`.
 *
 * The admin's Website editor rewrites that file through the GitHub API, which
 * triggers a rebuild — the same publish path as blog posts. The JSON is
 * imported here at build time, so it ships inside the bundle and nothing is
 * read at request time.
 *
 * Images (UGC examples) are paths under `public/`; uploads from the editor go
 * to `/blog-images/`.
 */
export type SiteContent = {
  hero: {
    badge: string;
    headlineLine1: string;
    headlineLine2: string;
    subheading: string;
    primaryButton: string;
    secondaryButton: string;
    footnote: string;
  };
  services: {
    eyebrow: string;
    heading: string;
    intro: string;
    items: { title: string; description: string }[];
  };
  ugc: {
    eyebrow: string;
    heading: string;
    intro: string;
    button: string;
    items: { title: string; blurb: string; image: string }[];
  };
  howItWorks: {
    eyebrow: string;
    heading: string;
    steps: { title: string; description: string }[];
  };
  plans: {
    eyebrow: string;
    heading: string;
    intro: string;
    button: string;
    highlightBadge: string;
    items: {
      name: string;
      tagline: string;
      /** Shown under the plan name when set, e.g. "$499 / month". */
      price: string;
      highlighted: boolean;
      deliverables: string[];
    }[];
    compareHeading: string;
    compareRows: { label: string; values: string[] }[];
    compareNote: string;
    addonsHeading: string;
    addonsText: string;
    addonsButton: string;
  };
  faq: {
    eyebrow: string;
    heading: string;
    intro: string;
    items: { question: string; answer: string }[];
  };
  finalCta: { heading: string; text: string; button: string };
  footer: { emails: string[]; marquee: string[] };
};

export const siteContent = raw as SiteContent;
