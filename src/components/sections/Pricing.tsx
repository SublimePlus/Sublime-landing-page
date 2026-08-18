"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Reveal } from "../Reveal";
import { PlusMark } from "../PlusMark";
import { BookMeetingButton } from "../booking/BookMeetingButton";
import { TopoBackground } from "../TopoBackground";
import { AnimatedSection } from "../AnimatedSection";
import { PlusField } from "../PlusField";

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
    tagline: "Finding your footing.",
    deliverables: [
      "10 posts per month",
      "Supporting comments included",
      "AI-generated, CM-reviewed",
      "Billed monthly, upfront",
    ],
  },
  {
    name: "Growth",
    tagline: "Building real momentum.",
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
    tagline: "Maximum volume, extra polish.",
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
    <AnimatedSection id="plans" className="relative overflow-hidden py-20">
      <TopoBackground className="text-pine/[0.06] dark:text-white/[0.05]" />
        <PlusField density="heavy" className="text-lime/60 dark:text-lime/25" />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-ink">
            Plans
          </p>
          <h2 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
            Pick your volume.
          </h2>
          <p className="mt-4 text-stone dark:text-white/60">
            Three packages, billed monthly and upfront. We walk you through
            every price on the call. Nothing hidden, nothing vague.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.1}>
              <PlanCard plan={plan} />
            </Reveal>
          ))}
        </div>

        <ComparisonTable />

        <Reveal delay={0.3} className="mt-6">
          <div className="neon-teal glass-panel flex flex-col items-center justify-between gap-6 rounded-2xl p-8 sm:flex-row">
            <div className="text-center sm:text-left">
              {/* SOP-S01 §10.5 — "Custom add-ons can be discussed." */}
              <h3 className="text-lg font-semibold text-pine dark:text-white">Custom add-ons</h3>
              <p className="mt-1 text-sm text-stone dark:text-white/60">
                Something outside the three? Bring it to the call and we will
                scope it with you.
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

/**
 * Side-by-side comparison of the three packages.
 *
 * Every row is a dimension SOP-S01 §10.5 actually varies or states. Rows that
 * would be conventional here — platforms covered, blog volume, reporting
 * cadence, support tier — are absent because that clause does not break them
 * down by package, and a table is the easiest place in the world for an
 * invented number to look authoritative.
 */
const comparisonRows: Array<{ label: string; values: [string, string, string] }> = [
  { label: "Posts per month", values: ["10", "25", "30"] },
  { label: "Supporting comments", values: ["Included", "Included", "Included"] },
  { label: "Quality layer", values: ["AI-generated", "AI-generated", "AI + human proofread"] },
  { label: "Human review before you see it", values: ["Yes", "Yes", "Yes"] },
  { label: "Your written approval before posting", values: ["Required", "Required", "Required"] },
  { label: "Billing", values: ["Monthly, upfront", "Monthly, upfront", "Monthly, upfront"] },
];

function ComparisonTable() {
  return (
    <Reveal delay={0.25} className="mt-10">
      <div className="glass-panel overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <caption className="sr-only">
            Comparison of the Starter, Growth and Pro packages
          </caption>
          <thead>
            <tr className="border-b border-pine/10 dark:border-white/10">
              <th scope="col" className="px-6 py-4 font-semibold text-pine dark:text-white">
                Compare
              </th>
              {plans.map((plan) => (
                <th
                  key={plan.name}
                  scope="col"
                  className={`px-6 py-4 font-semibold ${
                    plan.highlighted
                      ? "text-teal-ink dark:text-lime"
                      : "text-pine dark:text-white"
                  }`}
                >
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => (
              <tr
                key={row.label}
                className="border-b border-pine/[0.06] last:border-0 dark:border-white/[0.06]"
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-stone dark:text-white/70"
                >
                  {row.label}
                </th>
                {row.values.map((value, i) => (
                  <td
                    key={i}
                    className={`px-6 py-4 ${
                      plans[i].highlighted
                        ? "font-semibold text-pine dark:text-white"
                        : "text-stone dark:text-white/60"
                    }`}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 px-1 text-xs text-stone dark:text-white/50">
        Package prices are walked through in full on the call.
      </p>
    </Reveal>
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
        className={`relative flex h-full flex-col rounded-2xl p-7 ${
          plan.highlighted
            ? "neon-lime border border-teal bg-pine text-white shadow-lg"
            : "neon-teal glass-panel text-pine dark:text-white"
        }`}
      >
      {/* Badge marks the recommended package. */}
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
          Suggested
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
