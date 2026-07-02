"use client";

import { useState } from "react";
import { Reveal } from "../Reveal";
import { PlusMark } from "../PlusMark";
import { BookMeetingButton } from "../booking/BookMeetingButton";

type Plan = {
  name: string;
  tagline: string;
  deliverables: string[];
  highlighted?: boolean;
};

const plans: Plan[] = [
  {
    name: "Lite",
    tagline: "For brands just getting consistent.",
    deliverables: [
      "10 posts / month",
      "3 blog articles / month",
      "1 platform covered",
      "Monthly performance report",
      "Email support",
    ],
  },
  {
    name: "Pro",
    tagline: "For teams ready to scale their presence.",
    deliverables: [
      "18 posts / month",
      "5 blog articles / month",
      "Up to 3 platforms",
      "Bi-weekly performance report",
      "Community engagement included",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    name: "Max",
    tagline: "For brands going all in on content.",
    deliverables: [
      "32 posts / month",
      "9 blog articles / month",
      "Unlimited platforms",
      "Weekly performance report",
      "Full community management",
      "Dedicated account manager",
    ],
  },
];

export function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="plans" className="bg-pine/[0.03] py-28 dark:bg-white/[0.03]">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal">
            Plans
          </p>
          <h2 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
            Pick a scope. We&apos;ll handle the rest.
          </h2>
          <p className="mt-4 text-stone dark:text-white/60">
            Every plan includes a dedicated content team. Book a call and
            we&apos;ll recommend the right fit and share pricing.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full border border-pine/10 bg-white p-1 dark:border-white/10 dark:bg-night/40">
            <button
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                billing === "monthly" ? "bg-pine text-white dark:bg-teal" : "text-stone dark:text-white/60"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                billing === "yearly" ? "bg-pine text-white dark:bg-teal" : "text-stone dark:text-white/60"
              }`}
            >
              Yearly
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  billing === "yearly" ? "bg-lime text-pine" : "bg-lime/20 text-teal"
                }`}
              >
                Save 20%
              </span>
            </button>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.1}>
              <PlanCard plan={plan} billing={billing} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3} className="mt-6">
          <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-pine/10 bg-white p-8 sm:flex-row dark:border-white/10 dark:bg-night/40">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold text-pine dark:text-white">Custom Plan</h3>
              <p className="mt-1 text-sm text-stone dark:text-white/60">
                Need a different mix of platforms, volume, or languages?
                Let&apos;s scope something built around your goals.
              </p>
            </div>
            <BookMeetingButton
              planName="Custom"
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-pine px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal"
            >
              Book a Meeting
              <PlusMark className="h-4 w-4" strokeWidth={3} />
            </BookMeetingButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PlanCard({ plan, billing }: { plan: Plan; billing: "monthly" | "yearly" }) {
  return (
    <div
      className={`relative flex h-full flex-col rounded-2xl border p-7 ${
        plan.highlighted
          ? "border-teal bg-pine text-white shadow-lg"
          : "border-pine/10 bg-white text-pine dark:border-white/10 dark:bg-night/40 dark:text-white"
      }`}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime px-3 py-1 text-xs font-bold text-pine">
          Most Popular
        </span>
      )}
      {billing === "yearly" && (
        <span
          className={`absolute -top-3 right-4 rounded-full px-3 py-1 text-xs font-bold ${
            plan.highlighted ? "bg-white text-pine" : "bg-lime text-pine"
          }`}
        >
          20% OFF
        </span>
      )}

      <h3 className="text-xl font-bold">{plan.name}</h3>
      <p className={`mt-1 text-sm ${plan.highlighted ? "text-white/70" : "text-stone dark:text-white/60"}`}>
        {plan.tagline}
      </p>

      <p className={`mt-6 text-sm font-semibold ${plan.highlighted ? "text-lime" : "text-teal dark:text-lime"}`}>
        Contact us for pricing
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
          plan.highlighted ? "bg-lime text-pine" : "bg-pine text-white dark:bg-teal"
        }`}
      >
        Book a Meeting
        <PlusMark className="h-4 w-4" strokeWidth={3} />
      </BookMeetingButton>
    </div>
  );
}
