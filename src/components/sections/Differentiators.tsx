"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { PlusMark } from "../PlusMark";
import { TopoBackground } from "../TopoBackground";
import { AnimatedSection } from "../AnimatedSection";

/**
 * Each point is a commitment written into an SOP, not a marketing claim.
 * The previous version of this list asserted "real engagement from real
 * people", which directly contradicts SOP-009's AI-assisted model — it has
 * been replaced with what the SOPs actually guarantee.
 */
const points = [
  // SOP-001 §6.2.1 and SOP-U01 §3 — one CM owns the relationship.
  "One Customer Manager owns your account end to end — your single point of contact from onboarding onwards",
  // SOP-001 §5.5 — the LLM perception check, run before anything is written.
  "We show you how ChatGPT, Claude, Gemini and Perplexity describe your brand today, before we write a word",
  // SOP-002 §8.3 — the hard approval gate.
  "Nothing is published until you approve it in writing. No exceptions",
  // SOP-009 §4 and §8 — AI drafts, humans are accountable.
  "AI gives us speed; a human reads and verifies every draft before it reaches you, and carries the accountability for it",
  // SOP-007 §4 — the core ethical principles.
  "No fabricated statistics, testimonials or reviews, no astroturfing, and no fake negative feedback about your competitors",
];

export function Differentiators() {
  return (
    <AnimatedSection className="relative overflow-hidden py-28">
      <TopoBackground className="text-pine/[0.06] dark:text-white/[0.05]" />
      <div className="relative mx-auto max-w-6xl px-6">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-pine">
            <div className="duotone-teal absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80"
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute bottom-5 right-5 z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-lime text-pine shadow-lg"
            >
              <PlusMark className="h-6 w-6" strokeWidth={3} />
            </motion.span>
          </div>
        </Reveal>
        <div>
          <Reveal>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-ink">
              Why Sublime+
            </p>
            <h2 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
              Five things we put in writing.
            </h2>
          </Reveal>
          <ul className="mt-8 space-y-5">
            {points.map((point, i) => (
              <Reveal key={point} delay={i * 0.1}>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal dark:bg-white/10 dark:text-lime">
                    <PlusMark className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-stone dark:text-white/60">{point}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
      </div>
    </AnimatedSection>
  );
}
