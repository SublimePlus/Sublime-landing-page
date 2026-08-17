"use client";

import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { PlusMark } from "../PlusMark";
import { PlusField } from "../PlusField";
import { BookMeetingButton } from "../booking/BookMeetingButton";
import { TopoBackground } from "../TopoBackground";
import { AnimatedSection } from "../AnimatedSection";
import { useSpotlight, SpotlightOverlay } from "../SpotlightCard";
import { Carousel } from "../ui/Carousel";
import { ShowcaseCard } from "../ui/ShowcaseCard";
import { ugcShowcase } from "@/lib/ugc-showcase";

type Product = {
  title: string;
  description: string;
  icon: (props: { className?: string }) => React.ReactElement;
};

/** The four product lines from SOP-U01 §4, said plainly. */
const products: Product[] = [
  {
    // SOP-U01 §4.1
    title: "Faceless Content",
    description:
      "Send us your product. We put it in any setting you need — flat lays, lifestyle, hands-only — with nobody's face in the frame.",
    icon: ImageIcon,
  },
  {
    // SOP-U01 §4.2
    title: "AI Avatar Models",
    description:
      "AI-generated models holding, wearing or using your product. Approve the face first, then reuse it so every post looks like one campaign.",
    icon: PersonIcon,
  },
  {
    // SOP-U01 §4.3 — the likeness release is mandatory, so it is stated here.
    title: "Brand Ambassadors",
    description:
      "One recurring face for your brand. Use your real ambassador — with their signed release on file — or let us build a character to your spec.",
    icon: BadgeIcon,
  },
  {
    // SOP-U01 §4.4 — AI disclosure is not optional, so it is stated here.
    title: "AI Influencers",
    description:
      "Sponsor a post on one of our own creator personas, across ten niches from gaming to fitness. Every one is labelled as AI, every time.",
    icon: MegaphoneIcon,
  },
];

/** Delivery facts, each from SOP-U01. Kept to the six that answer a real question. */
const deliveryFacts = [
  "Single images or 2–6 slide carousels", // §5.2
  "Captions and on-image text included", // §5.2, §14.3
  "Instagram, Reddit, Facebook, Pinterest, Etsy, TikTok", // §5.1
  "First draft in under 5 working days", // §11.6
  "2–3 revisions, back within 1–2 days", // §13, §11.6
  "Nothing posts until you say yes", // §11.4, §16
];

export function Ugc() {
  return (
    <AnimatedSection id="ugc" className="relative overflow-hidden py-28">
      <TopoBackground className="text-pine/[0.06] dark:text-white/[0.05]" />
      <PlusField density="medium" className="text-lime/25 dark:text-lime/20" />
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
          <Carousel label="Sublime+ UGC product lines">
            {ugcShowcase.map((slide, i) => (
              <ShowcaseCard key={slide.title} {...slide} priority={i === 0} />
            ))}
          </Carousel>
        </Reveal>

        <div className="mt-20 grid gap-6 sm:grid-cols-2">
          {products.map((product, i) => (
            <Reveal key={product.title} delay={i * 0.08}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-10">
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
            Talk through your product
            <PlusMark className="h-4 w-4" strokeWidth={3} />
          </BookMeetingButton>
        </Reveal>
      </div>
    </AnimatedSection>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { x, y, onMouseMove } = useSpotlight();
  const Icon = product.icon;

  return (
    <motion.div
      onMouseMove={onMouseMove}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="neon-teal group relative flex h-full items-start gap-4 overflow-hidden rounded-2xl border border-pine/10 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-night/40"
    >
      <SpotlightOverlay x={x} y={y} />
      <motion.span
        whileHover={{ scale: 1.12, rotate: 6 }}
        transition={{ type: "spring", stiffness: 400, damping: 12 }}
        className="relative z-10 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-teal text-white"
      >
        <Icon className="h-5 w-5" />
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
