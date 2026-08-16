"use client";

import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { PlusMark } from "../PlusMark";
import { BookMeetingButton } from "../booking/BookMeetingButton";
import { TopoBackground } from "../TopoBackground";
import { AnimatedSection } from "../AnimatedSection";
import { useSpotlight, SpotlightOverlay } from "../SpotlightCard";

type Product = {
  title: string;
  description: string;
  icon: (props: { className?: string }) => React.ReactElement;
};

/** The four product lines defined in SOP-U01 §4. All four are available from
 *  launch; the descriptions below do not go beyond what that SOP states. */
const products: Product[] = [
  {
    // SOP-U01 §4.1
    title: "Faceless Content",
    description:
      "You send reference images of your product. We generate AI images of it in different environments and settings — flat lays, lifestyle shots, product-on-surface compositions and hands-only shots — with no human face in frame.",
    icon: ImageIcon,
  },
  {
    // SOP-U01 §4.2
    title: "AI Avatar Models",
    description:
      "AI-generated characters — not real people — holding, carrying, wearing or using your product. Approve the avatar before production, and reuse the same one across deliverables when you want visual consistency.",
    icon: PersonIcon,
  },
  {
    // SOP-U01 §4.3, both variants, including the mandatory likeness release.
    title: "Brand Ambassadors",
    description:
      "A recurring face for your brand: either your real ambassador's likeness, which requires their written consent and a signed likeness release before any work starts, or a character we create from scratch to your specification.",
    icon: BadgeIcon,
  },
  {
    // SOP-U01 §4.4 and §4.4.1, including the AI-disclosure rule.
    title: "AI Influencers & Bloggers",
    description:
      "Sponsor a post on one of our own AI creator personas — roughly ten niches at launch, from gaming and makeup to fitness, cooking, travel and tech. Every bio and post description states that the content is AI-generated.",
    icon: MegaphoneIcon,
  },
];

/** Delivery facts, each stated verbatim-in-substance from SOP-U01. */
const deliveryFacts = [
  // §5.2 Content Formats
  "Single images or carousels of 2–6 slides, in any standard aspect ratio",
  // §5.2 — captions included with every deliverable
  "Captions and on-image text included with every deliverable",
  // §5.1 Platforms
  "Instagram, Reddit, Facebook, Pinterest, Etsy and TikTok",
  // §11.6 Turnaround Times
  "First draft in under 5 working days from an approved brief",
  // §13 Revision Policy
  "2–3 revision rounds, revised content back within 1–2 business days",
  // §16 What We Never Do
  "Nothing is posted without your explicit approval",
];

export function Ugc() {
  return (
    <AnimatedSection id="ugc" className="relative overflow-hidden py-28">
      <TopoBackground className="text-pine/[0.06] dark:text-white/[0.05]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-ink">
            AI-powered content
          </p>
          <h2 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
            User-generated content, without waiting on users.
          </h2>
          <p className="mt-4 text-stone dark:text-white/60">
            Four AI-generated visual product lines. Every deliverable passes an
            internal quality review before you see it, and nothing goes live
            until you approve it.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {products.map((product, i) => (
            <Reveal key={product.title} delay={i * 0.08}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.25} className="mt-10">
          <ul className="grid gap-x-8 gap-y-3 rounded-2xl border border-pine/10 bg-white p-7 text-sm sm:grid-cols-2 dark:border-white/10 dark:bg-night/40">
            {deliveryFacts.map((fact) => (
              <li key={fact} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal dark:bg-white/10 dark:text-lime">
                  <PlusMark className="h-3 w-3" strokeWidth={3} />
                </span>
                <span className="text-stone dark:text-white/70">{fact}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.3} className="mt-12 text-center">
          <BookMeetingButton className="neon-teal-btn inline-flex items-center gap-2 rounded-full bg-pine px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] dark:bg-teal">
            Book Now
            <PlusMark className="h-4 w-4" strokeWidth={3} />
          </BookMeetingButton>
        </Reveal>
      </div>
    </AnimatedSection>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { x, y, onMouseMove } = useSpotlight();

  return (
    <motion.div
      onMouseMove={onMouseMove}
      whileHover={{ y: -6, rotate: -0.5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="neon-teal group relative flex h-full items-start gap-4 overflow-hidden rounded-2xl border border-pine/10 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-night/40"
    >
      <SpotlightOverlay x={x} y={y} />
      <motion.span
        whileHover={{ scale: 1.12, rotate: 6 }}
        transition={{ type: "spring", stiffness: 400, damping: 12 }}
        className="relative z-10 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-teal text-white"
      >
        <product.icon className="h-5 w-5" />
      </motion.span>
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-pine dark:text-white">
          {product.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-stone dark:text-white/60">
          {product.description}
        </p>
      </div>
    </motion.div>
  );
}

function iconProps(className?: string) {
  return {
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M4 17l5-5 3.5 3.5L16 12l4 5" />
    </svg>
  );
}
function PersonIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6" />
    </svg>
  );
}
function BadgeIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="9.5" r="5" />
      <path d="M8.5 13.8L7 21l5-2.6L17 21l-1.5-7.2" />
    </svg>
  );
}
function MegaphoneIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 11v2a2 2 0 0 0 2 2h1l1 5h2l-1-5h2l7 4V7l-7 4H6a2 2 0 0 0-2 2z" />
      <path d="M18 9.5v5" />
    </svg>
  );
}
