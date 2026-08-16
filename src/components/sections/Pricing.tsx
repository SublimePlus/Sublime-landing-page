"use client";

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
  return (
    <AnimatedSection id="plans" className="relative overflow-hidden bg-pine/[0.03] py-28 dark:bg-white/[0.03]">
      <TopoBackground className="text-pine/[0.06] dark:text-white/[0.05]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal">
            Plans
          </p>
          <h2 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
            Pick a scope. We&apos;ll handle the rest.
          </h2>
          <p className="mt-4 text-stone dark:text-white/60">
            Every plan includes a dedicated content team. Book a call and
            we&apos;ll recommend the right fit for your brand.
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
              <h3 className="text-lg font-semibold text-pine dark:text-white">Custom Plan</h3>
              <p className="mt-1 text-sm text-stone dark:text-white/60">
                Need a different mix of platforms, volume, or languages?
                Let&apos;s scope something built around your goals.
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

        <Reveal delay={0.4} className="mt-16">
          <div className="rounded-2xl border border-pine/10 bg-white p-8 dark:border-white/10 dark:bg-night/40">
            <h3 className="mb-8 text-center text-2xl font-bold text-pine dark:text-white">
              Plan Comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-pine/10 dark:border-white/10">
                    <th className="pb-4 text-left font-semibold text-pine dark:text-white">Feature</th>
                    <th className="pb-4 text-center font-semibold text-pine dark:text-white">Lite</th>
                    <th className="pb-4 text-center font-semibold text-pine dark:text-white">Pro</th>
                    <th className="pb-4 text-center font-semibold text-pine dark:text-white">Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pine/10 dark:divide-white/10">
                  <tr>
                    <td className="py-3 text-stone dark:text-white/70">Posts per month</td>
                    <td className="py-3 text-center text-pine dark:text-white">10</td>
                    <td className="py-3 text-center text-pine dark:text-white">18</td>
                    <td className="py-3 text-center text-pine dark:text-white">32</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-stone dark:text-white/70">Blog articles per month</td>
                    <td className="py-3 text-center text-pine dark:text-white">3</td>
                    <td className="py-3 text-center text-pine dark:text-white">5</td>
                    <td className="py-3 text-center text-pine dark:text-white">9</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-stone dark:text-white/70">Platforms covered</td>
                    <td className="py-3 text-center text-pine dark:text-white">1</td>
                    <td className="py-3 text-center text-pine dark:text-white">Up to 3</td>
                    <td className="py-3 text-center text-pine dark:text-white">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-stone dark:text-white/70">Performance reporting</td>
                    <td className="py-3 text-center text-pine dark:text-white">Monthly</td>
                    <td className="py-3 text-center text-pine dark:text-white">Bi-weekly</td>
                    <td className="py-3 text-center text-pine dark:text-white">Weekly</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-stone dark:text-white/70">Community engagement</td>
                    <td className="py-3 text-center">
                      <span className="text-stone dark:text-white/60">–</span>
                    </td>
                    <td className="py-3 text-center">
                      <PlusMark className="mx-auto h-4 w-4 text-teal" strokeWidth={3} />
                    </td>
                    <td className="py-3 text-center">
                      <PlusMark className="mx-auto h-4 w-4 text-teal" strokeWidth={3} />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-stone dark:text-white/70">Support tier</td>
                    <td className="py-3 text-center text-pine dark:text-white">Email</td>
                    <td className="py-3 text-center text-pine dark:text-white">Priority</td>
                    <td className="py-3 text-center text-pine dark:text-white">Dedicated manager</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>
    </AnimatedSection>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={`relative flex h-full flex-col rounded-2xl border p-7 transition-transform duration-300 hover:-translate-y-1 ${
        plan.highlighted
          ? "neon-lime border-teal bg-pine text-white shadow-lg"
          : "neon-teal border-pine/10 bg-white text-pine dark:border-white/10 dark:bg-night/40 dark:text-white"
      }`}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime px-3 py-1 text-xs font-bold text-pine">
          Most Popular
        </span>
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
    </div>
  );
}
