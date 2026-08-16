"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Reveal } from "../Reveal";
import { PlusMark } from "../PlusMark";
import { BookMeetingButton } from "../booking/BookMeetingButton";
import { TopoBackground } from "../TopoBackground";
import { AnimatedSection } from "../AnimatedSection";

type Plan = {
  name: string;
  tagline: string;
  deliverables: string[];
  highlighted?: boolean;
};

/**
 * The three standardised packages from SOP-S01 §10.5, with the SOP's own names
 * and post volumes. Prices are held back from the page by decision, and are
 * presented transparently on the call — SOP-S01 §10.4 requires exactly that:
 * no hidden costs, no ambiguity about what is being paid for.
 *
 * Deliberately not listed: blog counts, platform counts and report cadences
 * per tier. SOP-S01 §10.5 does not break those down by package, and inventing
 * a breakdown is the same failure as inventing a price.
 */
const plans: Plan[] = [
  {
    name: "Starter",
    tagline: "For brands establishing a presence.",
    deliverables: [
      "10 posts per month",
      "Supporting comments included",
      "AI-generated, CM-reviewed",
      "Billed monthly, upfront",
    ],
  },
  {
    name: "Growth",
    tagline: "For brands building momentum.",
    deliverables: [
      "25 posts per month",
      "Supporting comments included",
      "AI-generated, CM-reviewed",
      "Billed monthly, upfront",
    ],
    highlighted: true,
  },
  {
    name: "Pro",
    tagline: "For brands that need the extra quality layer.",
    deliverables: [
      "30 posts per month",
      "Supporting comments included",
      "AI-generated plus human proofread",
      "Billed monthly, upfront",
    ],
  },
];

export function Pricing() {
  return (
    <AnimatedSection id="plans" className="relative overflow-hidden bg-pine/[0.03] py-28 dark:bg-white/[0.03]">
      <TopoBackground className="text-pine/[0.06] dark:text-white/[0.05]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-ink">
            Plans
          </p>
          <h2 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
            Pick a scope. We&apos;ll handle the rest.
          </h2>
          <p className="mt-4 text-stone dark:text-white/60">
            Three standard packages, billed monthly and upfront. We walk through
            the full price of each one on the call — no hidden costs and no
            ambiguity about what you are paying for.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.1}>
              <PlanCard plan={plan} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3} className="mt-6">
          <div className="neon-teal flex flex-col items-center justify-between gap-6 rounded-2xl border border-pine/10 bg-white p-8 sm:flex-row dark:border-white/10 dark:bg-night/40">
            <div className="text-center sm:text-left">
              {/* SOP-S01 §10.5 — "Custom add-ons can be discussed." */}
              <h3 className="text-lg font-semibold text-pine dark:text-white">Custom add-ons</h3>
              <p className="mt-1 text-sm text-stone dark:text-white/60">
                Need something outside the three packages? Bring it to the call
                and we will scope it with you.
              </p>
            </div>
            <BookMeetingButton
              planName="Custom"
              className="neon-teal-btn inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-pine px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal"
            >
              Book Now
              <PlusMark className="h-4 w-4" strokeWidth={3} />
            </BookMeetingButton>
          </div>
        </Reveal>
      </div>
    </AnimatedSection>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 6);
    rotateX.set(py * -6);
  }

  function onMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div style={{ perspective: 900 }}>
      <motion.div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className={`relative flex h-full flex-col rounded-2xl border p-7 ${
          plan.highlighted
            ? "neon-lime border-teal bg-pine text-white shadow-lg"
            : "neon-teal border-pine/10 bg-white text-pine dark:border-white/10 dark:bg-night/40 dark:text-white"
        }`}
      >
      {/* The badge previously read "Most Popular". No SOP or sales record
          supports a popularity claim, so it states the SOP-documented fact
          instead: Growth is the middle package. */}
      {plan.highlighted && (
        <motion.span
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime px-3 py-1 text-xs font-bold text-pine"
          animate={{
            boxShadow: [
              "0 0 0px rgba(201,242,78,0)",
              "0 0 14px rgba(201,242,78,0.6)",
              "0 0 0px rgba(201,242,78,0)",
            ],
          }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          Mid tier
        </motion.span>
      )}
      <h3 className="text-xl font-bold">{plan.name}</h3>
      <p className={`mt-1 text-sm ${plan.highlighted ? "text-white/70" : "text-stone dark:text-white/60"}`}>
        {plan.tagline}
      </p>

      <ul className="mt-6 flex-1 space-y-3">
        {plan.deliverables.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm">
            <span
              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                plan.highlighted ? "bg-white/15 text-lime" : "bg-teal/10 text-teal dark:bg-white/10 dark:text-lime"
              }`}
            >
              <PlusMark className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className={plan.highlighted ? "text-white/85" : "text-stone dark:text-white/70"}>{item}</span>
          </li>
        ))}
      </ul>

      <BookMeetingButton
        planName={plan.name}
        className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:scale-[1.02] ${
          plan.highlighted ? "neon-lime-btn bg-lime text-pine" : "neon-teal-btn bg-pine text-white dark:bg-teal"
        }`}
      >
        Book Now
        <PlusMark className="h-4 w-4" strokeWidth={3} />
      </BookMeetingButton>
      </motion.div>
    </div>
  );
}
