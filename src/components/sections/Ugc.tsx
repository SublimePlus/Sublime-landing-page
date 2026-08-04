"use client";

import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { PlusMark } from "../PlusMark";
import { BookMeetingButton } from "../booking/BookMeetingButton";
import { TopoBackground } from "../TopoBackground";

const products = [
  {
    title: "Faceless Content",
    description:
      "AI-generated product visuals — flat lays, lifestyle shots, hands-only compositions — in as many settings as your feed needs, no shoot required.",
    icon: ImageIcon,
  },
  {
    title: "AI Avatar Models",
    description:
      "Consistent AI-generated models shown holding, wearing, or using your product, so every deliverable looks like one continuous campaign.",
    icon: PersonIcon,
  },
  {
    title: "Brand Ambassadors",
    description:
      "A recurring face for your brand — built from your real ambassador's likeness or created from scratch — appearing across every piece of content.",
    icon: BadgeIcon,
  },
  {
    title: "AI Influencers & Bloggers",
    description:
      "Sponsored posts from our library of AI-generated creator personas across gaming, beauty, fitness, travel, and more — always clearly disclosed.",
    icon: MegaphoneIcon,
  },
];

export function Ugc() {
  return (
    <section id="ugc" className="relative overflow-hidden py-28">
      <TopoBackground className="text-pine/[0.06] dark:text-white/[0.05]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal">
            AI-powered content
          </p>
          <h2 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
            User-generated content, without waiting on users.
          </h2>
          <p className="mt-4 text-stone dark:text-white/60">
            Premium, on-brand visuals generated and human-reviewed for your
            product — every deliverable is clearly AI-disclosed and built to
            look like it belongs in your feed.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {products.map((product, i) => (
            <Reveal key={product.title} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -6, rotate: -0.5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex h-full items-start gap-4 rounded-2xl border border-pine/10 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-night/40"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-teal text-white">
                  <product.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-pine dark:text-white">
                    {product.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone dark:text-white/60">
                    {product.description}
                  </p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3} className="mt-12 text-center">
          <BookMeetingButton className="inline-flex items-center gap-2 rounded-full bg-pine px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] dark:bg-teal">
            Book Now
            <PlusMark className="h-4 w-4" strokeWidth={3} />
          </BookMeetingButton>
        </Reveal>
      </div>
    </section>
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
