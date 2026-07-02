"use client";

import { motion } from "framer-motion";
import { Reveal } from "../Reveal";

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
    <section id="how-it-works" className="bg-pine/[0.03] py-28">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal">
            How it works
          </p>
          <h2 className="text-3xl font-bold text-pine sm:text-4xl">
            Three steps to content that runs itself.
          </h2>
        </Reveal>

        <div className="relative mt-20 grid gap-14 sm:grid-cols-3">
          <svg
            className="pointer-events-none absolute left-0 top-6 hidden w-full sm:block"
            height="4"
            viewBox="0 0 100 1"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line
              x1="16"
              y1="0.5"
              x2="84"
              y2="0.5"
              stroke="#1b3a2f"
              strokeOpacity="0.12"
              strokeWidth="1"
            />
            <motion.line
              x1="16"
              y1="0.5"
              x2="84"
              y2="0.5"
              stroke="#3c866b"
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>

          {steps.map((s, i) => (
            <Reveal key={s.step} delay={i * 0.15} className="relative text-center sm:text-left">
              <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal text-sm font-bold text-white sm:mx-0">
                {s.step}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-pine">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone">
                {s.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
