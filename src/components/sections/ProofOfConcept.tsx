"use client";

import { Reveal } from "../Reveal";
import { TopoBackground } from "../TopoBackground";
import { AnimatedSection } from "../AnimatedSection";

const proofPoints = [
  {
    quote:
      "Sublime+ picked up our voice within a week. Our engagement has been steadier than it's ever been — and we stopped thinking about content entirely.",
    name: "Amara O.",
    role: "Founder, local retail brand",
  },
  {
    quote:
      "They write like they've been in the room for every meeting. The reporting alone is worth it — we finally know what's actually working.",
    name: "Devon K.",
    role: "Marketing lead, growth-stage startup",
  },
  {
    quote:
      "Handing off content felt risky at first. Six months in, it's the easiest part of our marketing.",
    name: "Priya S.",
    role: "Creator & small business owner",
  },
];

export function ProofOfConcept() {
  return (
    <AnimatedSection className="relative overflow-hidden bg-pine/[0.03] py-28 dark:bg-white/[0.03]">
      <TopoBackground className="text-pine/[0.06] dark:text-white/[0.05]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal">
            Proof of Concept
          </p>
          <h2 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
            Real results from real teams.
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {proofPoints.map((point, i) => (
            <Reveal key={point.name} delay={i * 0.1}>
              <figure className="neon-teal h-full rounded-2xl bg-white p-7 shadow-sm dark:bg-night/40">
                <span className="font-script text-4xl leading-none text-lime">&ldquo;</span>
                <blockquote className="text-sm leading-relaxed text-stone dark:text-white/70">
                  {point.quote}
                </blockquote>
                <figcaption className="mt-5 border-t border-pine/10 pt-4 dark:border-white/10">
                  <p className="text-sm font-semibold text-pine dark:text-white">{point.name}</p>
                  <p className="text-xs text-stone dark:text-white/50">{point.role}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
