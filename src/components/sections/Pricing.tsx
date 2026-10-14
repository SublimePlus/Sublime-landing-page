"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Reveal } from "../Reveal";
import { PlusMark } from "../PlusMark";
import { BookMeetingButton } from "../booking/BookMeetingButton";
import { TopoBackground } from "../TopoBackground";
import { AnimatedSection } from "../AnimatedSection";
import { PlusField } from "../PlusField";
import { siteContent } from "@/lib/site-content";

type Plan = (typeof siteContent.plans.items)[number];
const copy = siteContent.plans;

/**
 * Plans, comparison rows and copy come from `content/site.json` (editable in
 * /admin). A plan's price shows only when it is filled in; until then prices
 * stay on the call, as before.
 */
const plans: Plan[] = copy.items;

export function Pricing() {
  return (
    <AnimatedSection id="plans" className="relative overflow-hidden py-20">
      <TopoBackground className="text-pine/[0.06] dark:text-white/[0.05]" />
        <PlusField density="heavy" className="text-lime/60 dark:text-lime/25" />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-ink">
            {copy.eyebrow}
          </p>
          <h2 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
            {copy.heading}
          </h2>
          <p className="mt-4 text-stone dark:text-white/60">
            {copy.intro}
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
              <h3 className="text-lg font-semibold text-pine dark:text-white">{copy.addonsHeading}</h3>
              <p className="mt-1 text-sm text-stone dark:text-white/60">
                {copy.addonsText}
              </p>
            </div>
            <BookMeetingButton
              planName="Custom"
              className="neon-teal-btn inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-pine px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal"
            >
              {copy.addonsButton}
              <PlusMark className="h-4 w-4" strokeWidth={3} />
            </BookMeetingButton>
          </div>
        </Reveal>
      </div>
    </AnimatedSection>
  );
}

const comparisonRows = copy.compareRows;

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
                {copy.compareHeading}
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
                      plans[i]?.highlighted
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
        {copy.compareNote}
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
          {copy.highlightBadge}
        </motion.span>
      )}
      <h3 className="text-xl font-bold">{plan.name}</h3>
      <p className={`mt-1 text-sm ${plan.highlighted ? "text-white/70" : "text-stone dark:text-white/60"}`}>
        {plan.tagline}
      </p>
      {plan.price && (
        <p className={`mt-4 text-3xl font-bold ${plan.highlighted ? "text-lime" : "text-pine dark:text-white"}`}>
          {plan.price}
        </p>
      )}

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
        {copy.button}
        <PlusMark className="h-4 w-4" strokeWidth={3} />
      </BookMeetingButton>
      </motion.div>
    </div>
  );
}
