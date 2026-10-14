"use client";

import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { TopoBackground } from "../TopoBackground";
import { AnimatedSection } from "../AnimatedSection";
import { PlusField } from "../PlusField";
import { siteContent } from "@/lib/site-content";

/** Steps come from `content/site.json` (editable in /admin); numbers follow
 *  their order. */
const steps = siteContent.howItWorks.steps.map((step, i) => ({
  ...step,
  step: String(i + 1).padStart(2, "0"),
}));

export function HowItWorks() {
  return (
    <AnimatedSection id="how-it-works" className="relative overflow-hidden py-20">
      <TopoBackground className="text-pine/[0.07] dark:text-white/[0.06]" />
      <PlusField density="heavy" className="text-lime/60 dark:text-lime/25" />
      <div className="relative mx-auto max-w-5xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-ink">
            {siteContent.howItWorks.eyebrow}
          </p>
          <h2 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
            {siteContent.howItWorks.heading}
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
