"use client";

import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { PlusMark } from "../PlusMark";
import { TopoBackground } from "../TopoBackground";

const points = [
  "A dedicated team that learns your brand voice, not a rotating cast of freelancers",
  "Content calendars planned weeks ahead — never scrambling for tomorrow's post",
  "Real engagement from real people, not canned auto-replies",
  "Monthly reporting that connects content to actual growth",
];

export function Differentiators() {
  return (
    <section className="relative overflow-hidden py-28">
      <TopoBackground className="text-pine/[0.06] dark:text-white/[0.05]" />
      <div className="relative mx-auto max-w-6xl px-6">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-pine">
            <div className="duotone-teal absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80')] bg-cover bg-center" />
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute bottom-5 right-5 z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-lime text-pine shadow-lg"
            >
              <PlusMark className="h-6 w-6" strokeWidth={3} />
            </motion.span>
          </div>
        </Reveal>
        <div>
          <Reveal>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal">
              Why Sublime+
            </p>
            <h2 className="text-3xl font-bold text-pine sm:text-4xl dark:text-white">
              A creative partner, not another vendor.
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
    </section>
  );
}
