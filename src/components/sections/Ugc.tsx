"use client";

import { Reveal } from "../Reveal";
import { PlusMark } from "../PlusMark";
import { PlusField } from "../PlusField";
import { BookMeetingButton } from "../booking/BookMeetingButton";
import { TopoBackground } from "../TopoBackground";
import { AnimatedSection } from "../AnimatedSection";
import { FeatureCarousel } from "../ui/FeatureCarousel";

type Product = {
  title: string;
  /** One-line explanation shown over the carousel card. */
  blurb: string;
  /** Example output for this line, shown on the carousel card. */
  image: string;
  icon: (props: { className?: string }) => React.ReactElement;
};

/** The four product lines from SOP-U01 §4, said plainly. Images are the
 *  client-supplied examples in `public/showcase`, one per line, in order. */
const products: Product[] = [
  {
    // SOP-U01 §4.1
    title: "Faceless Content",
    blurb: "Your product in any setting, with nobody in the frame.",
    image: "/showcase/faceless.jpg",
    icon: ImageIcon,
  },
  {
    // SOP-U01 §4.2
    title: "AI Avatar Models",
    blurb: "One AI model you approve, reused across every post.",
    image: "/showcase/ai-model.webp",
    icon: PersonIcon,
  },
  {
    // SOP-U01 §4.3 — the likeness release is mandatory, so it is stated here.
    title: "Brand Ambassadors",
    blurb: "A recurring face for your brand, yours or one we build.",
    image: "/showcase/ambassador.webp",
    icon: BadgeIcon,
  },
  {
    // SOP-U01 §4.4 — AI disclosure is not optional, so it is stated here.
    title: "AI Influencers",
    blurb: "Sponsored posts on our creator accounts, always AI labelled.",
    image: "/showcase/ai-influencer.webp",
    icon: MegaphoneIcon,
  },
];

export function Ugc() {
  return (
    <AnimatedSection id="ugc" className="relative overflow-hidden py-20">
      <TopoBackground className="text-pine/[0.06] dark:text-white/[0.05]" />
      <PlusField density="heavy" className="text-lime/60 dark:text-lime/25" />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-ink">
            Visual content
          </p>
          <h2 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
            A photoshoot you never have to book.
          </h2>
          <p className="mt-4 text-stone dark:text-white/60">
            Four AI product lines. Every image is reviewed internally before it
            reaches you, and waits for your approval before it goes anywhere.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-14">
          <FeatureCarousel
            features={products.map((p) => ({
              id: p.title,
              label: p.title,
              description: p.blurb,
              image: p.image,
              icon: p.icon,
            }))}
          />
        </Reveal>

        <Reveal delay={0.3} className="mt-10 text-center">
          <BookMeetingButton className="neon-teal-btn inline-flex items-center gap-2 rounded-full bg-pine px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] dark:bg-teal">
            Talk through your product
            <PlusMark className="h-4 w-4" strokeWidth={3} />
          </BookMeetingButton>
        </Reveal>
      </div>
    </AnimatedSection>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M4 17l5-5 3.5 3.5L16 12l4 5" />
    </svg>
  );
}

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6" />
    </svg>
  );
}

function BadgeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="5" />
      <path d="M8.5 13.8L7 21l5-2.6L17 21l-1.5-7.2" />
    </svg>
  );
}

function MegaphoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11v2a2 2 0 0 0 2 2h1l1 5h2l-1-5h2l7 4V7l-7 4H6a2 2 0 0 0-2 2z" />
    </svg>
  );
}
