"use client";

import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { TopoBackground } from "../TopoBackground";
import { AnimatedSection } from "../AnimatedSection";

const steps = [
  {
    step: "01",
    title: "We learn your brand",
    description:
      "A kickoff deep-dive into your voice, audience, and goals — so everything we make sounds like you.",
  },
  {
    step: "02",
    title: "We create & schedule",
    description:
      "Content calendars, posts, and blogs planned and produced weeks ahead of time.",
  },
  {
    step: "03",
    title: "We engage & report",
    description:
      "Ongoing community management with clear, monthly reporting on growth and performance.",
  },
];

export function HowItWorks() {
  return (
    <AnimatedSection id="how-it-works" className="relative overflow-hidden bg-pine/[0.03] py-28 dark:bg-white/[0.03]">
      <TopoBackground className="text-pine/[0.07] dark:text-white/[0.06]" />
      <div className="relative mx-auto max-w-5xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal">
            How it works
          </p>
          <h2 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
            Three steps to content that runs itself.
          </h2>
        </Reveal>

        <div className="mt-20 grid gap-14 sm:grid-cols-3">
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
