"use client";

import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { TopoBackground } from "../TopoBackground";
import { AnimatedSection } from "../AnimatedSection";
import { PlusField } from "../PlusField";

/** The onboarding-to-live pipeline exactly as SOP-001, SOP-002 and SOP-004
 *  define it. Timings below are the SOP's own committed timelines. */
const steps = [
  {
    step: "01",
    // SOP-001 §5 — the research phase, completed before the meeting.
    title: "We do the homework",
    description:
      "Before we meet we audit your site, socials, reviews and SEO, then ask the AI models what they say about you. You get it all back as a deck.",
  },
  {
    step: "02",
    // SOP-001 §6 (30–45 min Google Meet, client alignment, Client Context
    // Document) and SOP-002 §5 (content plan, Senior Manager approval).
    title: "We agree on the plan",
    description:
      "One 30–45 minute call. You tell us what we got right and what we got wrong. That becomes your plan: subreddits, themes, schedule, tone.",
  },
  {
    step: "03",
    // SOP-001 §6.2.6 timeline; SOP-002 §8.3 approval gate; SOP-004 §6 verify.
    title: "You approve. We post.",
    description:
      "First drafts land in 2–4 business days. Your first content is live in 7–10. And not a word of it posts before you sign off.",
  },
];

export function HowItWorks() {
  return (
    <AnimatedSection id="how-it-works" className="relative overflow-hidden py-20">
      <TopoBackground className="text-pine/[0.07] dark:text-white/[0.06]" />
      <PlusField density="heavy" className="text-lime/60 dark:text-lime/25" />
      <div className="relative mx-auto max-w-5xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-ink">
            How it works
          </p>
          <h2 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
            Live in 7–10 business days.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-12 sm:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.step} delay={i * 0.15} className="text-center sm:text-left">
              <div className="relative flex h-12 w-full items-center justify-center">
                {i < steps.length - 1 && (
                  <>
                    <div className="absolute left-[calc(50%+24px)] top-1/2 hidden h-[1.5px] w-[calc(100%+8px)] -translate-y-1/2 bg-pine/10 sm:block dark:bg-white/10" />
                    <motion.div
                      className="absolute left-[calc(50%+24px)] top-1/2 hidden h-[1.5px] w-[calc(100%+8px)] origin-left -translate-y-1/2 bg-teal sm:block"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: false, margin: "-80px" }}
                      transition={{
                        duration: 0.6,
                        delay: i * 0.15 + 0.35,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  </>
                )}
                <motion.div
                  className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-teal text-sm font-bold text-white"
                  initial={{ scale: 0.4, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: false, margin: "-80px" }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 18,
                    delay: i * 0.15,
                  }}
                >
                  {s.step}
                </motion.div>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-pine dark:text-white">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone dark:text-white/60">
                {s.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
